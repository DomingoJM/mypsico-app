import React from "react";

interface LogoProps {
  size?: number;           // Tamaño en px – por defecto 70
  text?: boolean;          // Mostrar o no el texto MYPSICO
  centered?: boolean;      // Permite centrar el bloque completo
}

const Logo: React.FC<LogoProps> = ({ size = 70, text = true, centered = false }) => {
  return (
    <div className={`${centered ? "flex flex-col items-center" : ""}`}>
      
      {/* LOGO PNG o SVG */}
      <img
        src="/mypsico-logo.png"
        alt="MyPsico Logo"
        style={{ width: size, height: size }}
        className="opacity-95"
      />

      {/* TEXTO OPCIONAL */}
      {text && (
        <p className="mt-2 tracking-[0.30em] uppercase text-[0.75rem] text-gray-700 font-light">
          MYPSICO
        </p>
      )}
    </div>
  );
};

export default Logo;
