import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../App';
import { EyeIcon, EyeSlashIcon } from '../shared/Icons';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useContext(AuthContext);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Verificar que el contexto de autenticación esté disponible
    if (!auth) {
      setError('Error: Servicio de autenticación no disponible');
      setLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        await auth.login(email, password);
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
      } else {
        const data = await auth.register(name, email, password);
        // Si no hay una sesión después del registro, significa que se requiere confirmación por correo.
        if (!data?.session) {
          setRegistrationSuccess(true);
        }
        // Si hay una sesión, el listener onAuthStateChange en App.tsx se encargará
        // del inicio de sesión y la redirección automáticamente.
      }
    } catch (err: unknown) {
        console.error("Authentication Error:", err);
        let errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';

        // Universal, robust message extraction
        if (err && typeof err === 'object' && 'message' in err) {
            const errorObject = err as { message: string, [key: string]: any };
            const message = errorObject.message.toLowerCase();

            if (isLogin) {
                if (message.includes('invalid login credentials')) {
                    errorMessage = "Correo electrónico o contraseña incorrectos.";
                } else if (message.includes('email not confirmed')) {
                    errorMessage = "Tu cuenta aún no ha sido confirmada. Por favor, revisa tu correo electrónico.";
                } else {
                    errorMessage = errorObject.message;
                }
            } else { // Registration
                if (errorObject.code === 'user_already_exists' || message.includes('user already registered') || (errorObject.status === 422 && message.includes('user already exists'))) {
                    errorMessage = "Este correo electrónico ya está registrado. Intenta iniciar sesión.";
                } else if (message.includes('password should be at least 6 characters')) {
                    errorMessage = "La contraseña debe tener al menos 6 caracteres.";
                } else if (message.includes('unable to validate email address')) {
                    errorMessage = "El formato del correo electrónico no es válido.";
                } else {
                    errorMessage = errorObject.message;
                }
            }
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
        
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="w-full max-w-md mx-auto z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif text-white tracking-wider drop-shadow-lg">MyPsico</h1>
          <p className="text-white/90 mt-2 text-lg drop-shadow-md">Tu espacio para sanar.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl transition-all duration-500">
            {registrationSuccess ? (
                <div className="text-center py-8 px-4 transition-all duration-500 animate-fade-in-up">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <h2 className="mt-6 text-2xl font-bold text-brand-dark">¡Revisa tu correo para confirmar!</h2>
                    <p className="mt-4 text-brand-text">
                        Te hemos enviado un enlace de confirmación a <strong className="text-brand-dark">{email}</strong>.
                    </p>
                    <p className="mt-2 text-brand-text">
                        Por favor, haz clic en el enlace para activar tu cuenta. Una vez confirmado, podrás iniciar sesión.
                    </p>
                    <p className="mt-4 text-sm text-slate-500">
                        ¿No recibes el correo? Puede tardar unos minutos o estar en tu carpeta de spam. Si el problema continúa, es posible que la configuración de envío de correos del proyecto necesite ser ajustada en el panel de Supabase.
                    </p>
                    <button
                        onClick={() => {
                            setRegistrationSuccess(false);
                            setIsLogin(true);
                        }}
                        className="mt-8 w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors duration-300"
                    >
                        Entendido, ir a Iniciar Sesión
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex border-b mb-6">
                        <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 ${isLogin ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-500'}`}
                        >
                        Iniciar Sesión
                        </button>
                        <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 text-lg font-semibold transition-colors duration-300 ${!isLogin ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-500'}`}
                        >
                        Registrarse
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
                        {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-brand-text font-semibold mb-2">Nombre</label>
                            <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre completo"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white/70"
                            />
                        </div>
                        )}
                        <div>
                        <label htmlFor="email" className="block text-brand-text font-semibold mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                            autoComplete="email"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white/70"
                        />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-brand-text font-semibold mb-2">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white/70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <EyeSlashIcon className="h-6 w-6 text-slate-500" /> : <EyeIcon className="h-6 w-6 text-slate-500" />}
                                </button>
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-brand-primary focus:ring-brand-secondary border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-text">
                                    Recordarme
                                </label>
                            </div>
                        )}

                        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                        
                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors duration-300 disabled:bg-slate-400 !mt-6"
                        >
                        {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
                        </button>
                    </form>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;