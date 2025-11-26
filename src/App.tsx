import React, { useState, useEffect, createContext } from "react";
import { supabase } from "./supabase";
import LoadingScreen from "./src/shared/LoadingScreen";
import { AppLogo } from "./src/shared/AppLogo";
import AuthScreen from "./src/components/auth/AuthScreen";

// Definir el tipo del contexto
interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    checkUser();
    
    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setTimeout(() => {
        setInitialLoading(false);
        setLoading(false);
      }, 1500);
    }
  };

  // Función de login
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    setUser(data.user);
  };

  // Función de registro
  const register = async (name: string, email: string, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    
    if (authData.user) {
      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          email,
          role: 'patient' // rol por defecto
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }
    }

    return authData;
  };

  // Función de logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Pantalla de carga inicial
  if (initialLoading) {
    return <LoadingScreen />;
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return (
      <AuthContext.Provider value={{ user, login, register, logout }}>
        <AuthScreen />
      </AuthContext.Provider>
    );
  }

  // Si hay usuario autenticado, mostrar dashboard
  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AppLogo className="w-32 h-10" imageUrl="/MyPsico.png" />
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Bienvenido a MyPsico!
            </h1>
            <p className="text-gray-600 mb-8">
              Tu espacio para el crecimiento personal y el bienestar emocional
            </p>
            
            <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Estado de la aplicación:</h2>
              <div className="space-y-3 text-left">
                <p className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Sistema de autenticación funcionando</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Usuario: {user.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-yellow-500 text-xl">⚠</span>
                  <span>Falta implementar: Dashboard de paciente/terapeuta/admin</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;