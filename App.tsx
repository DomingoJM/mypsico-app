import React, { useState, useEffect, createContext } from "react";
import LoadingScreen from "./shared/LoadingScreen";
import Logo from "./components/Logo";

export const AuthContext = createContext(null);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500); // Carga suave y rápida
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white">
      {/* Logo principal arriba del login */}
      <Logo size={200} />

      <h1 className="text-3xl font-light tracking-[0.25em] mt-6">MYPSICO</h1>
      <p className="mt-2 text-gray-500 text-sm">Bienvenido • Inicia para continuar</p>

      {/* Aquí se monta tu login + routing */}
      <div className="w-full max-w-sm mt-8 shadow-lg p-8 rounded-xl bg-white">
        {/* IMPORTANTE: más adelante reemplazaremos esto
           por tu formulario real */}
        <p className="text-center text-gray-400">[Formulario Login Aquí]</p>
      </div>
    </div>
  );
};

export default App;
