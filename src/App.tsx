import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import LoadingScreen from "./shared/LoadingScreen";
import AuthScreen from "./auth/AuthScreen";
import AdminDashboard from "./components/dashboard/admin/AdminDashboard";
import TherapistDashboard from "./components/dashboard/therapist/TherapistDashboard";
import PatientDashboard from "./components/dashboard/patient/PatientDashboard";
import PublicHome from "./pages/PublicHome";
import VisitorHome from "./pages/VisitorHome";

// Tipo del contexto
interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Componente interno que usa el hook de navegación
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    checkUser();
// EXPOSE TEMPORAL PARA DEBUG
// ❗ luego lo quitamos
// @ts-ignore
  window.supabase = supabase;
  // @ts-ignore
  window.supabase = supabase;

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
      }, 3500); // 3.5 segundos para que coincida con la animación
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
    if (!user || isRedirecting) return;

    const loadRole = async () => {
      console.log("🔄 Iniciando redirección para usuario:", user.id);
      setIsRedirecting(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("❌ Error al cargar rol:", error);
        setIsRedirecting(false);
        return;
      }

      console.log("✅ Rol obtenido:", data?.role);

      // Usar navigate en lugar de window.location.href
      switch (data?.role) {
        case "patient":
          console.log("➡️ Redirigiendo a /patientHome");
          navigate("/patientHome", { replace: true });
          break;
        case "therapist":
          console.log("➡️ Redirigiendo a /therapistDashboard");
          navigate("/therapistDashboard", { replace: true });
          break;
        case "admin":
          console.log("➡️ Redirigiendo a /adminDashboard");
          navigate("/adminDashboard", { replace: true });
          break;
        case "visitor":
        default:
          console.log("➡️ Redirigiendo a /publicHome");
          navigate("/publicHome", { replace: true }); 
          break;
      }
      
      // Resetear el estado después de navegar
      setTimeout(() => setIsRedirecting(false), 100);
    };

    loadRole();
  }, [user, navigate]);

  // ------------------------ UI ------------------------
  if (initialLoading || isRedirecting) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <Routes>
        <Route path="/login" element={!user ? <AuthScreen /> : <Navigate to="/" replace />} />
        <Route path="/adminDashboard" element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/therapistDashboard" element={user ? <TherapistDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/patientHome" element={user ? <PatientDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/publicHome" element={<PublicHome />} />
        <Route path="/" element={<VisitorHome />} />
      </Routes>
    </AuthContext.Provider>
  );
};

// Componente principal con el Router
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
