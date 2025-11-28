import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 fixed inset-0 z-50">
      
      <style>{`
        @keyframes breatheAndGrow {
          0% { 
            transform: scale(1);
            opacity: 0.7;
          }
          40% { 
            transform: scale(1.05);
            opacity: 1;
          }
          70% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% { 
            transform: scale(5);
            opacity: 0.95;
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
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .breathe-and-grow {
          animation: breatheAndGrow 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .gentle-pulse {
          animation: gentlePulse 2s ease-in-out infinite, fadeOut 3.5s ease-out forwards;
        }
        .slide-up {
          animation: slideUp 0.8s ease-out forwards, fadeOut 3.5s ease-out forwards;
        }
      `}</style>
      
      <div className="flex flex-col items-center">
        
        {/* LOGO con animación de respiración y crecimiento */}
        <div className="breathe-and-grow mb-6">
          <img 
            src="/icon-512.png" 
            alt="MyPsico Logo" 
            className="w-32 h-32 drop-shadow-lg"
          />
        </div>

        {/* Marca elegante */}
        <h2 className="text-3xl font-serif tracking-[0.20em] text-gray-700 slide-up mb-2">
          MyPs<span style={{fontSize: '0.75em'}}>Ψ</span>co
        </h2>

        {/* Eslogan sutil */}
        <p className="text-sm text-gray-500 font-light tracking-wide slide-up mb-6" style={{ animationDelay: '0.2s' }}>
          Tu espacio para sanar
        </p>

        {/* Línea decorativa */}
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-300 to-transparent my-4 slide-up" style={{ animationDelay: '0.4s' }}></div>

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
