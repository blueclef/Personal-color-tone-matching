import React, { useState, useCallback, useRef } from 'react';
import Icon from './Icon';

interface ImageUploaderProps {
  onImageUpload: (base64: string, file: File) => void;
  title: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        const base64String = result.split(',')[1];
        onImageUpload(base64String, file);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageUpload("", new File([], ""));
  }

  return (
    <div 
      className="w-full bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer text-center relative"
      onClick={handleClick}
    >
      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-md" />
          <button onClick={handleReset} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-48">
          <Icon name="upload" className="w-8 h-8 text-gray-400 mb-2" />
          <p className="font-semibold text-gray-700">{title}</p>
          <p className="text-sm text-gray-500">클릭하여 파일 선택</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;