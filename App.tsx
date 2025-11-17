
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, Role } from './types';
import { supabaseService } from './services/supabaseService';
import { supabase } from './supabase';
import AuthScreen from './components/auth/AuthScreen';
import Dashboard from './components/dashboard/Dashboard';
import type { User as AuthUser, Session } from '@supabase/supabase-js';
import LoadingScreen from './components/shared/LoadingScreen';


export const AuthContext = React.createContext<{
  user: User | null;
  originalUser: User | null;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ user: AuthUser | null, session: Session | null }>;
  simulateRole: (role: Role) => void;
} | null>(null);


const SupabaseCredentialsMissingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 p-4 font-sans">
      <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-2xl border border-red-200">
        <h1 className="text-3xl font-bold mb-4 text-center text-red-700">Error de Configuración</h1>
        <p className="text-lg mb-4 text-slate-700 text-center">
          La aplicación no puede conectarse a la base de datos.
        </p>
        <p className="mb-6 text-slate-600">
          Parece que las credenciales de Supabase no han sido configuradas. Por favor, abre el archivo <strong>supabase.ts</strong> en tu editor de código y reemplaza los valores de ejemplo con tus claves reales.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg shadow-inner text-left text-sm font-mono text-white overflow-x-auto">
          <pre><code>
            <span className="text-pink-400">const</span> <span className="text-sky-300">SUPABASE_URL</span> = <span className="text-emerald-300">'YOUR_SUPABASE_URL'</span>;<br />
            <span className="text-pink-400">const</span> <span className="text-sky-300">SUPABASE_ANON_KEY</span> = <span className="text-emerald-300">'YOUR_SUPABASE_ANON_KEY'</span>;
          </code></pre>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Puedes encontrar estas claves en tu panel de Supabase, en la sección de "Project Settings" &gt; "API". Después de guardar los cambios, la aplicación debería funcionar.
        </p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Guard clause to prevent app crash if Supabase is not configured.
  if (!supabase) {
    return <SupabaseCredentialsMissingScreen />;
  }

  useEffect(() => {
    setLoading(true);
    setInitError(null);

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userProfile = await supabaseService.getUserProfile(session.user);
          setOriginalUser(userProfile);
          setUser(userProfile);
        } else {
          setOriginalUser(null);
          setUser(null);
        }
        // Fetch logo regardless of auth state
        const url = await supabaseService.getSetting('logo_url');
        setLogoUrl(url);
      } catch (error: unknown) {
        console.error("Error during initial session check:", error);
        if (error instanceof Error) {
            setInitError(error.message);
        } else {
            setInitError("Ocurrió un error inesperado al iniciar la aplicación.");
        }
        setOriginalUser(null);
        setUser(null);
      } finally {
        // Ensure the loading screen is always removed after the initial check.
        setLoading(false);
      }
    };

    checkInitialSession();

    // Then, set up the listener for any subsequent changes in auth state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // The listener updates the user state in real-time.
      if (session?.user) {
        setInitError(null); // Clear error on successful auth change
        const userProfile = await supabaseService.getUserProfile(session.user);
        setOriginalUser(userProfile);
        setUser(userProfile);
      } else {
        setOriginalUser(null);
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: authUser } = await supabaseService.login(email, password);
    if (authUser) {
      // The onAuthStateChange listener will also handle this, but setting it here
      // provides a faster UI response.
      const userProfile = await supabaseService.getUserProfile(authUser);
      setOriginalUser(userProfile);
      setUser(userProfile);
      setInitError(null); // Clear previous errors on successful login
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error);
    }
    // The onAuthStateChange listener will automatically handle clearing user state.
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    return await supabaseService.register(name, email, password);
  }, []);
  

  const simulateRole = useCallback((newRole: Role) => {
      if (!originalUser) return;

      // If the selected role is the user's actual role, restore the original user object.
      if (newRole === originalUser.role) {
          setUser(originalUser);
      } else {
          // Otherwise, create a new simulated user object based on the original one.
          setUser({ ...originalUser, role: newRole });
      }
  }, [originalUser]);

  const authContextValue = useMemo(() => ({ user, originalUser, login, logout, register, simulateRole, logoUrl, setLogoUrl }), [user, originalUser, login, logout, register, simulateRole, logoUrl]);

  if (loading) {
    return <LoadingScreen />;
  }

  // If there's an initialization error, show a dedicated screen.
  // This blocks the rest of the app until the connection issue is resolved (by refreshing).
  if (initError) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-900 p-4 font-sans">
            <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-2xl border border-red-200 text-center">
                <h1 className="text-3xl font-bold mb-4 text-red-700">Error de Conexión</h1>
                <p className="text-lg mb-6 text-slate-700">
                    No se pudo establecer la conexión con la base de datos.
                </p>

                <div className="bg-brand-light border-l-4 border-brand-primary p-6 rounded-lg text-left mb-6">
                    <h2 className="font-bold text-xl text-brand-dark">La base de datos puede estar en pausa.</h2>
                    <p className="mt-2 text-slate-600">
                        Los proyectos en el plan gratuito de Supabase se pausan después de un período de inactividad. La primera solicitud del día puede tardar más en "despertarla".
                    </p>
                    <p className="mt-2 text-slate-600">
                        Por favor, <strong>refresca la página</strong> para intentarlo de nuevo.
                    </p>
                </div>

                <button onClick={() => window.location.reload()} className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors text-lg">
                    Refrescar Página
                </button>

                <details className="mt-6 text-left text-sm text-slate-500">
                    <summary className="cursor-pointer font-semibold">Ver detalles técnicos del error</summary>
                    <div className="mt-2 bg-slate-800 p-3 rounded-lg font-mono text-white text-xs overflow-x-auto">
                        {initError}
                    </div>
                </details>
            </div>
        </div>
    );
  }

  const renderContent = () => {
    if (!user) {
      return <AuthScreen />;
    }
    return <Dashboard />;
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="min-h-screen bg-brand-light font-sans text-brand-text">
        {renderContent()}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
