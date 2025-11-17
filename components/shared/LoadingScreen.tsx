import React from 'react';
import { AppLogo } from './AppLogo';

const LoadingScreen: React.FC = () => {
    return (
        <div 
            className="h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2940&auto=format&fit=crop')" }}
        >
             <div className="absolute inset-0 bg-black/30"></div>
            <div className="text-center z-10 animate-fade-in-up">
                <AppLogo className="h-24 w-auto mx-auto animate-pulse" />
                <h1 
                    className="text-5xl font-serif text-white tracking-wider mt-4"
                >
                    MYPSICO
                </h1>
                <p className="text-white/90 mt-4 text-xl drop-shadow-md">Cargando tu espacio de sanación...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;