import React, { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedDataUrl: string) => void;
  onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onClose }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setBrightness(100);
    setContrast(100);
  }, [imageSrc]);

  const handleSave = () => {
    const image = imageRef.current;
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const editedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(editedDataUrl);
    };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">사진 편집</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close editor">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
             <img 
              ref={imageRef}
              src={imageSrc} 
              alt="Editor preview" 
              className="max-w-full max-h-[50vh] object-contain"
              style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
            />
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="brightness" className="block text-sm font-medium text-gray-700 mb-1">밝기: {brightness}%</label>
              <input 
                id="brightness"
                type="range" 
                min="50" 
                max="150" 
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label htmlFor="contrast" className="block text-sm font-medium text-gray-700 mb-1">대비: {contrast}%</label>
              <input 
                id="contrast"
                type="range" 
                min="50" 
                max="150" 
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
              취소
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
