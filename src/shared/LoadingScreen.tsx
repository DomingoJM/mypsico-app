import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 fixed inset-0 z-50">
      
      <style>{`
        @keyframes breathe {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: scale(1.05);
            opacity: 1;
          }
        }
        @keyframes gentlePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .breathe-animation {
          animation: breathe 3s ease-in-out infinite;
        }
        .gentle-pulse {
          animation: gentlePulse 2s ease-in-out infinite;
        }
        .slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
      
      <div className="flex flex-col items-center">
        
        {/* LOGO con animación de respiración */}
        <div className="breathe-animation mb-6">
          <img 
            src="/MyPsico.png" 
            alt="MyPsico Logo" 
            className="w-32 h-32 drop-shadow-lg"
          />
        </div>

        {/* Marca elegante */}
        <h2 className="text-3xl font-serif tracking-[0.20em] text-gray-700 slide-up mb-2">
          MyPsico
        </h2>

        {/* Eslogan sutil */}
        <p className="text-sm text-gray-500 font-light tracking-wide slide-up mb-6" style={{ animationDelay: '0.2s' }}>
          Tu espacio para sanar
        </p>

        {/* Línea decorativa */}
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-300 to-transparent my-4"></div>

        {/* Indicador de carga orgánico */}
        <div className="flex gap-2 mt-4">
          <div className="w-2 h-2 bg-purple-400 rounded-full gentle-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full gentle-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full gentle-pulse" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
