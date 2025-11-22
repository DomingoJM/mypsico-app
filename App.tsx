// FIX: Remove reference to vite/client as it's causing resolution errors.
// The code will be modified to use process.env for the Gemini API key as per guidelines.
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, Role } from './types';
import { supabaseService } from './services/supabaseService';
import { supabase } from './supabase';
import AuthScreen from './components/auth/AuthScreen';
import Dashboard from './components/dashboard/Dashboard';
import type { User as AuthUser, Session } from '@supabase/supabase-js';
import LoadingScreen from './components/shared/LoadingScreen';
import ConsentModal from './components/consent/ConsentModal';
import { useConsent } from './hooks/useConsent';

export const AuthContext = React.createContext<{
  user: User | null;
  originalUser: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ user: AuthUser | null, session: Session | null }>;
  simulateRole: (role: Role) => void;
} | null>(null);

const ConfigurationErrorScreen: React.FC<{ error: string }> = ({ error }) => {
    const isSupabaseError = error.includes("Supabase");
    const isGeminiError = error.includes("Gemini");

    const requiredKeys = [];
    if (isSupabaseError) {
        requiredKeys.push({ name: 'VITE_SUPABASE_URL' });
        requiredKeys.push({ name: 'VITE_SUPABASE_ANON_KEY' });
    }
    if (isGeminiError) {
        // FIX: Update required key name to VITE_API_KEY to align with user's Vercel setup.
        requiredKeys.push({ name: 'VITE_API_KEY' });
    }

    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 font-sans">
          <div className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-red-200">
              <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <h1 className="text-3xl font-bold font-serif text-red-800 mt-4">Error de Configuración</h1>
                  <p className="text-lg mt-2 text-slate-700">
                      La aplicación no pudo iniciarse correctamente. Por favor, revisa el siguiente problema:
                  </p>
              </div>
              
              <div className="mt-8 text-left bg-red-50/50 border-l-4 border-red-400 p-6 rounded-lg">
                  <h2 className="font-bold text-xl text-red-900">Detalle del Error</h2>
                  <p className="mt-2 text-red-800 font-mono text-sm bg-red-100 p-3 rounded">{error}</p>
              </div>

              {requiredKeys.length > 0 && (
                <div className="mt-6">
                  <p className="text-slate-700">Para solucionar este problema, debes añadir las siguientes "variables de entorno" a la configuración de tu proyecto en Vercel (o tu plataforma de despliegue) y luego hacer un **Redeploy**.</p>
                  <div className="mt-4 space-y-4 font-mono text-sm">
                      {requiredKeys.map(key => (
                          <div key={key.name} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                              <code className="bg-slate-200 text-slate-800 px-2 py-1 rounded">{key.name}</code>
                              <button onClick={() => handleCopy(key.name)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-xs font-sans font-semibold">Copiar Nombre</button>
                          </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="mt-8 text-center">
                  <button onClick={() => window.location.reload()} className="w-full sm:w-auto bg-brand-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-brand-dark transition-colors text-lg">
                      Refrescar Página
                  </button>
              </div>
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

  useEffect(() => {
    setLoading(true);
    setInitError(null);
    
    // --- Unified Configuration Check ---
    if (!supabase) {
      setInitError("Error de Supabase: Las variables 'VITE_SUPABASE_URL' o 'VITE_SUPABASE_ANON_KEY' no están configuradas. Por favor, añádelas a tus variables de entorno.");
      setLoading(false);
      return;
    }
    // FIX: Use process.env.VITE_API_KEY to match user's Vercel configuration.
    if (!process.env.VITE_API_KEY) {
      // FIX: Update error message to refer to VITE_API_KEY.
      setInitError("Error de Gemini: La variable 'VITE_API_KEY' no está configurada. Por favor, añádela a tus variables de entorno.");
      setLoading(false);
      return;
    }


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
        let errorMessage = "Ocurrió un error inesperado al iniciar la aplicación.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('network error')) {
            errorMessage = `Error de Supabase: No se pudo conectar a la URL de tu proyecto. Verifica que 'VITE_SUPABASE_URL' sea correcta y que tu conexión a internet funcione.`;
        } else if (errorMessage.toLowerCase().includes('invalid authentication credentials')) {
            errorMessage = "Error de Supabase: Credenciales inválidas. Verifica que la 'VITE_SUPABASE_ANON_KEY' sea correcta.";
        }
        
        setInitError(errorMessage);
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

  const authContextValue = useMemo(() => ({ user, originalUser, setUser, login, logout, register, simulateRole, logoUrl, setLogoUrl }), [user, originalUser, setUser, login, logout, register, simulateRole, logoUrl]);
  
  const { showConsent, closeConsent } = useConsent();

  if (loading) {
    return <LoadingScreen />;
  }

  // Use the new unified error screen for ALL initialization errors.
  if (initError) {
    return <ConfigurationErrorScreen error={initError} />;
  }

  const renderContent = () => {
    if (!user) {
      return <AuthScreen />;
    }
    return (
      <>
        <Dashboard />
        <ConsentModal 
          isOpen={showConsent} 
          onClose={closeConsent} 
        />
      </>
    );
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