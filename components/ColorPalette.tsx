import React from 'react';
import Icon from './Icon';
import { Color } from '../types';

interface ColorPaletteProps {
  colors: Color[];
  onColorSelect: (color: string) => void;
  selectedColor: string | null;
  disabled: boolean;
}

// Simple utility to get contrasting text color (white or black)
const getTextColorForBackground = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onColorSelect, selectedColor, disabled }) => {
  return (
    <div className={`w-full bg-white p-4 rounded-lg border border-gray-200 shadow-sm mt-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center mb-3">
        <Icon name="color-swatch" className="w-6 h-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">추천 컬러 팔레트</h3>
      </div>
       {!disabled && <p className="text-sm text-gray-500 mb-3">의상 사진을 올리고 컬러를 클릭해 가상 피팅을 해보세요.</p>}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {colors.map((color) => (
          <div
            key={color.hex}
            onClick={() => !disabled && onColorSelect(color.hex)}
            className={`w-full aspect-square rounded-md transition-transform transform hover:scale-110 relative flex items-center justify-center text-center p-1 ${
              selectedColor === color.hex ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-gray-200'
            } ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            style={{ backgroundColor: color.hex, color: getTextColorForBackground(color.hex) }}
            title={color.name}
          >
            <span className="text-xs font-semibold break-words">{color.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
