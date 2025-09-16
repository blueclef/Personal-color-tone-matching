import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-md p-4">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          AI 퍼스널 컬러 스타일리스트
        </h1>
        <p className="text-md text-gray-500 mt-1">
          퍼스널 컬러를 분석하고, 원하는 옷을 골라 가상으로 입어보세요.
        </p>
      </div>
    </header>
  );
};

export default Header;
