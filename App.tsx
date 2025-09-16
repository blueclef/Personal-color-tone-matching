import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ColorPalette from './components/ColorPalette';
import Loader from './components/Loader';
import Icon from './components/Icon';
import { analyzeSkinToneAndSuggestColors, performVirtualTryOn } from './services/geminiService';
import { Color } from './types';

interface ImageState {
  base64: string;
  file: File;
}

function App() {
  const [personImage, setPersonImage] = useState<ImageState | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageState | null>(null);
  const [palette, setPalette] = useState<Color[] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonImageUpload = useCallback((base64: string, file: File) => {
    if (base64 && file.name) {
      setPersonImage({ base64, file });
    } else {
      setPersonImage(null);
    }
    setPalette(null);
    setSelectedColor(null);
    setResultImage(null);
    setError(null);
  }, []);

  const handleClothingImageUpload = useCallback((base64: string, file: File) => {
    if (base64 && file.name) {
      setClothingImage({ base64, file });
    } else {
      setClothingImage(null);
    }
    setSelectedColor(null);
    setResultImage(null);
  }, []);

  const handleAnalyzeClick = async () => {
    if (!personImage) return;
    setError(null);
    setIsAnalyzing(true);
    setPalette(null);
    setResultImage(null);
    setSelectedColor(null);
    try {
      const colors = await analyzeSkinToneAndSuggestColors(personImage.base64);
      setPalette(colors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleColorSelect = async (color: string) => {
    if (!personImage || !clothingImage) return;
    
    setSelectedColor(color);
    setError(null);
    setIsGenerating(true);
    setResultImage(null);

    try {
      const newImageBase64 = await performVirtualTryOn(
        personImage.base64,
        personImage.file.type,
        clothingImage.base64,
        clothingImage.file.type,
        color
      );
      setResultImage(`data:image/png;base64,${newImageBase64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const initialResultImage = personImage ? URL.createObjectURL(personImage.file) : null;
  const currentImage = resultImage || initialResultImage;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">오류 발생: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls Column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-700">1단계: 본인 사진 업로드</h3>
              <ImageUploader
                title="퍼스널 컬러 분석용 사진"
                onImageUpload={handlePersonImageUpload}
              />
            </div>
            <button
              onClick={handleAnalyzeClick}
              disabled={!personImage || isAnalyzing}
              className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <Icon name="sparkles" className="w-5 h-5 mr-2" />
                  퍼스널 컬러 분석
                </>
              )}
            </button>
            <div className="flex flex-col gap-2">
              <h3 className={`text-lg font-semibold ${!palette ? 'text-gray-400' : 'text-gray-700'}`}>2단계: 의상 사진 업로드</h3>
               <div className={`${!palette ? 'opacity-50 pointer-events-none' : ''}`}>
                 <ImageUploader
                    title="가상 피팅용 의상 사진"
                    onImageUpload={handleClothingImageUpload}
                  />
               </div>
            </div>

            <div className="relative">
              {isAnalyzing && <Loader text="AI가 퍼스널 컬러를 분석중입니다..." />}
              {palette && (
                <ColorPalette
                  colors={palette}
                  selectedColor={selectedColor}
                  onColorSelect={handleColorSelect}
                  disabled={!clothingImage}
                />
              )}
            </div>
          </div>

          {/* Result Column */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm min-h-[300px] flex flex-col items-center justify-center relative">
            {(isGenerating) && <Loader text="AI가 의상을 가상으로 입히고 있습니다..." />}
             <div className="w-full flex justify-between items-center mb-4">
               <h3 className="text-xl font-semibold text-gray-800">AI 가상 피팅 스튜디오</h3>
                {resultImage && (
                  <a
                    href={resultImage}
                    download={`virtual-try-on-${new Date().getTime()}.png`}
                    className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Icon name="download" className="w-5 h-5 mr-2" />
                    다운로드
                  </a>
                )}
             </div>
            
            {currentImage ? (
                <img src={currentImage} alt="Virtual try-on result" className="w-full max-w-lg object-contain rounded-md" />
            ) : (
                <div className="text-center text-gray-500">
                    <p>사진을 업로드하고 분석을 시작해주세요.</p>
                    <p className="text-sm mt-1">추천 컬러를 클릭하면 가상 피팅이 시작됩니다.</p>
                </div>
            )}
          </div>
        </div>
      </main>
      <footer className="w-full text-center p-4 text-gray-500 text-sm">
        <p>Powered by Google Gemini API. Created for demonstration purposes.</p>
      </footer>
    </div>
  );
}

export default App;
