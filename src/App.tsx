import React, { useState, useEffect, createContext } from "react";
import { supabase } from "./supabase";
import LoadingScreen from "./shared/LoadingScreen";
import { AppLogo } from "./shared/AppLogo";
import AuthScreen from "./auth/AuthScreen";

// Tipo del contexto
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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
      }, 1200);
    }
  };

  // ------------------------ LOGIN ------------------------
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
  };

  // ------------------------ REGISTRO ------------------------
  const register = async (name: string, email: string, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) throw authError;

    if (authData.user) {
      await supabase.from("profiles").insert({
        id: authData.user.id,
        name,
        email,
        role: "patient" // default
      });
    }

    return authData;
  };

  // ------------------------ LOGOUT ------------------------
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ------------------------ REDIRECCIÓN POR ROL ------------------------
  useEffect(() => {
    if (!user) return;

    const loadRole = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // DIRECTO Y SIN ROMANTICISMO 😅
      switch (data?.role) {
        case "patient":
          window.location.href = "/patientHome";
          break;
        case "therapist":
          window.location.href = "/therapistDashboard";
          break;
        case "admin":
          window.location.href = "/adminDashboard";
          break;
        case "visitor":
        default:
          window.location.href = "/publicHome"; 
          break;
      }
    };

    loadRole();
  }, [user]);

  // ------------------------ UI ------------------------
  if (initialLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, login, register, logout }}>
        <AuthScreen />
      </AuthContext.Provider>
    );
  }
console.log(">>> USER SESSION:", user);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <AppLogo className="w-32 h-10" imageUrl="/MyPsico.png" />
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          <h1 className="text-3xl font-bold text-gray-800 text-center mb-3">Cargando entorno...</h1>
          <p className="text-center text-gray-600">Redirigiendo al dashboard correspondiente</p>
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
