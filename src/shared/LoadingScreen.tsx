import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white fixed inset-0 z-50">
      
      <div className="flex flex-col items-center animate-pulse">
        
        {/* LOGO — si tu archivo se llama distinto, cambia el nombre */}
        <img 
          src="/mypsico-logo.png" 
          alt="MyPsico Logo" 
          className="w-20 h-20 mb-6 opacity-90"
        />

        {/* Marca sobria */}
        <h2 className="text-2xl font-light tracking-[0.30em] uppercase text-gray-800">
          MYPSICO
        </h2>

        {/* Línea sutil */}
        <div className="h-px w-20 bg-gray-300 my-4"></div>

        {/* Carga suave */}
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          Cargando...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
