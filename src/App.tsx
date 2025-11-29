import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import { User, UserRole } from "./types";
import LoadingScreen from "./shared/LoadingScreen";
import AuthScreen from "./auth/AuthScreen";
import AdminDashboard from "./components/dashboard/admin/AdminDashboard";
import TherapistDashboard from "./components/dashboard/therapist/TherapistDashboard";
import PatientDashboard from "./components/dashboard/patient/PatientDashboard";
import PublicHome from "./pages/PublicHome";
import VisitorHome from "./pages/VisitorHome";
import UsersManagement from "./pages/admin/UsersManagement";
import ContentManagement from "./pages/admin/ContentManagement";

// ==================== TIPOS ====================
interface AuthContextType {
  user: User | null;
  originalUser: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ user: any; session: any }>;
  simulateRole: (role: UserRole) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// ==================== COMPONENTE PRINCIPAL ====================
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ==================== INICIALIZACIÓN ====================
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("🔐 Auth event:", event);
            
            if (session?.user) {
              await loadUserProfile(session.user.id);
            } else {
              setUser(null);
              setOriginalUser(null);
            }
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("❌ Error al inicializar auth:", error);
      } finally {
        setTimeout(() => setInitialLoading(false), 1000);
      }
    };

    initializeAuth();
  }, []);

  // ==================== CARGAR PERFIL COMPLETO ====================
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const userProfile: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: mapRole(data.role),
        photo_url: data.photo_url,
        spiritual_path: data.spiritual_path,
        created_at: data.created_at,
        is_active: data.status === "active",
      };

      setUser(userProfile);
      setOriginalUser(userProfile);
      
      console.log("✅ Usuario cargado:", userProfile);
    } catch (error) {
      console.error("❌ Error al cargar perfil:", error);
    }
  };

  // ==================== MAPEAR ROLES ====================
  const mapRole = (roleStr: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
      admin: UserRole.Admin,
      terapeuta: UserRole.Therapist,
      paciente: UserRole.Patient,
    };
    return roleMap[roleStr] || UserRole.Patient;
  };

  // ==================== LOGIN ====================
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    
    if (data.user) {
      await loadUserProfile(data.user.id);
    }
  };

  // ==================== REGISTRO ====================
  const register = async (name: string, email: string, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    
    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        name,
        email,
        role: "paciente",
        status: "active",
      });

      if (profileError) {
        console.error("❌ Error al crear perfil:", profileError);
        throw profileError;
      }
    }

    return authData;
  };

  // ==================== LOGOUT ====================
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOriginalUser(null);
    navigate("/login");
  };

  // ==================== SIMULACIÓN DE ROLES (ADMIN) ====================
  const simulateRole = (role: UserRole) => {
    if (!originalUser || originalUser.role !== UserRole.Admin) {
      console.warn("⚠️ Solo admins pueden simular roles");
      return;
    }

    setUser({ ...originalUser, role });
    console.log("🎭 Simulando rol:", role);
  };

  // ==================== REDIRECCIÓN POR ROL ====================
  useEffect(() => {
    if (!user || isRedirecting || initialLoading) return;

    const redirectByRole = () => {
      const currentPath = window.location.pathname;
      
      const validPaths: Record<UserRole, string[]> = {
        [UserRole.Admin]: ["/admin", "/adminDashboard"],
        [UserRole.Therapist]: ["/therapist", "/therapistDashboard"],
        [UserRole.Patient]: ["/patient", "/patientHome"],
      };

      const isValidPath = validPaths[user.role]?.some(path => 
        currentPath.startsWith(path)
      );

      if (isValidPath) {
        console.log("✅ Ruta válida para", user.role);
        return;
      }

      if (currentPath !== "/" && currentPath !== "/login") {
        console.log("⏭️ No redirigir desde", currentPath);
        return;
      }

      setIsRedirecting(true);

      const routes: Record<UserRole, string> = {
        [UserRole.Admin]: "/adminDashboard",
        [UserRole.Therapist]: "/therapistDashboard",
        [UserRole.Patient]: "/patientHome",
      };

      const targetRoute = routes[user.role] || "/publicHome";
      console.log("➡️ Redirigiendo a:", targetRoute);
      
      navigate(targetRoute, { replace: true });
      setTimeout(() => setIsRedirecting(false), 300);
    };

    redirectByRole();
  }, [user, navigate, isRedirecting, initialLoading]);

  // ==================== RENDER ====================
  if (initialLoading || isRedirecting) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        originalUser,
        setUser,
        logoUrl, 
        setLogoUrl, 
        login, 
        register, 
        logout,
        simulateRole 
      }}
    >
      <Routes>
        <Route path="/" element={<VisitorHome />} />
        <Route path="/publicHome" element={<PublicHome />} />
        <Route 
          path="/login" 
          element={!user ? <AuthScreen /> : <Navigate to="/" replace />} 
        />

        <Route 
          path="/adminDashboard" 
          element={user ? <AdminDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/admin/users" 
          element={user ? <UsersManagement /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/admin/content" 
          element={user ? <ContentManagement /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/therapistDashboard" 
          element={user ? <TherapistDashboard /> : <Navigate to="/login" replace />} 
        />

        <Route 
          path="/patientHome" 
          element={user ? <PatientDashboard /> : <Navigate to="/login" replace />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  );
};

// ==================== WRAPPER CON ROUTER ====================
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

// ==================== FUNCIONES DE CONTENIDO ====================
export const getContents = async () => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addContent = async (contentData: any) => {
  const { data, error } = await supabase
    .from('content')
    .insert([contentData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateContent = async (id: number, updates: any) => {
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteContent = async (id: number) => {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getContentById = async (id: number) => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};