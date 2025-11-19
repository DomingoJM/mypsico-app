import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white z-50 fixed inset-0">
      <div className="animate-pulse flex flex-col items-center">
        <h2 className="text-2xl font-light tracking-[0.3em] uppercase text-black">MYPSICO</h2>
        <div className="h-px w-16 bg-gray-300 my-4"></div>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;