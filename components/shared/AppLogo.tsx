import React from 'react';

interface AppLogoProps {
  className?: string;
  imageUrl?: string | null;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, imageUrl }) => {
  if (imageUrl) {
    return <img src={imageUrl} alt="MYPSICO Logo" className={className} />;
  }

  // Fallback to new default SVG logo for MYPSICO
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MYPSICO Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B7A8F" /> 
          <stop offset="100%" stopColor="#D8A7B1" /> 
        </linearGradient>
      </defs>
      <path
        d="M20 100 V30 L40 50 L60 30 V100 H40 V65 L20 85 V100 Z"
        fill="url(#logoGradient)"
      />
      <path
        d="M60 30 C 80 10, 100 30, 100 50 C 100 70, 80 90, 60 70"
        fill="url(#logoGradient)"
      />
    </svg>
  );
};
