import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ColorPalette from './components/ColorPalette';
import Loader from './components/Loader';
import Icon from './components/Icon';
import { analyzeSkinToneAndSuggestColors, recolorClothingImage } from './services/geminiService';

interface ImageState {
  base64: string;
  file: File;
}

function App() {
  const [userImage, setUserImage] = useState<ImageState | null>(null);
  const [palette, setPalette] = useState<string[] | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecoloring, setIsRecoloring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((base64: string, file: File) => {
    if (base64 && file.name) {
      setUserImage({ base64, file });
    } else {
      setUserImage(null);
    }
    setPalette(null);
    setSelectedColor(null);
    setResultImage(null);
    setError(null);
  }, []);

  const handleAnalyzeClick = async () => {
    if (!userImage) return;
    setError(null);
    setIsAnalyzing(true);
    setPalette(null);
    setResultImage(null);
    setSelectedColor(null);
    try {
      const colors = await analyzeSkinToneAndSuggestColors(userImage.base64);
      setPalette(colors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleColorSelect = async (color: string) => {
    if (!userImage) return;
    
    setSelectedColor(color);
    setError(null);
    setIsRecoloring(true);
    setResultImage(null);

    try {
      const newImageBase64 = await recolorClothingImage(
        userImage.base64,
        userImage.file.type,
        color
      );
      setResultImage(`data:${userImage.file.type};base64,${newImageBase64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsRecoloring(false);
    }
  };

  const currentImage = resultImage || (userImage ? URL.createObjectURL(userImage.file) : null);

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
            <ImageUploader
              title="분석 및 가상 피팅 사진 업로드"
              onImageUpload={handleImageUpload}
            />
            <button
              onClick={handleAnalyzeClick}
              disabled={!userImage || isAnalyzing}
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

            <div className="relative">
              {isAnalyzing && <Loader text="AI가 퍼스널 컬러를 분석중입니다..." />}
              {palette && (
                <ColorPalette
                  colors={palette}
                  selectedColor={selectedColor}
                  onColorSelect={handleColorSelect}
                />
              )}
            </div>
          </div>

          {/* Result Column */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm min-h-[300px] flex flex-col items-center justify-center relative">
            {(isRecoloring) && <Loader text="AI가 의상 색상을 변경하고 있습니다..." />}
            <h3 className="text-xl font-semibold text-gray-800 mb-4 self-start">AI 가상 피팅 스튜디오</h3>
            {currentImage ? (
                <img src={currentImage} alt="Virtual try-on result" className="w-full max-w-lg object-contain rounded-md" />
            ) : (
                <div className="text-center text-gray-500">
                    <p>가상 피팅을 위해 사진을 업로드 해주세요.</p>
                    <p className="text-sm mt-1">분석 후, 추천 컬러를 클릭하면 옷 색상이 변경됩니다.</p>
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