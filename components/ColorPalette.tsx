
import React from 'react';
import Icon from './Icon';

interface ColorPaletteProps {
  colors: string[];
  onColorSelect: (color: string) => void;
  selectedColor: string | null;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onColorSelect, selectedColor }) => {
  return (
    <div className="w-full bg-white p-4 rounded-lg border border-gray-200 shadow-sm mt-4">
      <div className="flex items-center mb-3">
        <Icon name="color-swatch" className="w-6 h-6 text-blue-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">추천 컬러 팔레트</h3>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => onColorSelect(color)}
            className={`w-full pt-[100%] rounded-md cursor-pointer transition-transform transform hover:scale-110 relative border-2 ${
              selectedColor === color ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
