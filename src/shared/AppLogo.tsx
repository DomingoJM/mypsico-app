import React from 'react';

interface AppLogoProps {
  className?: string;
  imageUrl?: string | null;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, imageUrl }) => {
  if (imageUrl) {
    return <img src={imageUrl} alt="MYPSICO Logo" className={className} />;
  }

  // Fallback to a simple, clean text-based SVG logo.
  // This avoids artistic conflicts and ensures the admin-uploaded logo is the primary visual.
  return (
    <svg
      viewBox="0 0 300 60"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="MYPSICO Logo"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Lora, serif"
        fontSize="48"
        fill="#414A5A"
        fontWeight="600"
      >
        MYPSICO
      </text>
    </svg>
  );
};
