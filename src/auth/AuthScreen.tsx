import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
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
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 relative overflow-hidden"
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="w-full max-w-md mx-auto z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <img src="/icon-512.png" alt="MyPsico" className="h-20 mx-auto opacity-90" />
          </div>
          <h1 className="text-5xl font-serif text-gray-800 tracking-wide mb-2">MyPs<span style={{fontSize: '0.75em'}}>Ψ</span>co</h1>
          <p className="text-gray-600 text-lg font-light">Tu espacio para sanar.</p>
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
        `}</style>

        <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/50 transition-all duration-500">
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
                    <div className="flex border-b-2 border-gray-100 mb-6">
                        <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 relative ${isLogin ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                        Iniciar Sesión
                        {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"></div>}
                        </button>
                        <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-3 text-lg font-semibold transition-all duration-300 relative ${!isLogin ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                        Registrarse
                        {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"></div>}
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up">
                        {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Nombre completo</label>
                            <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre completo"
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white transition-all"
                            />
                        </div>
                        )}
                        <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            required
                            autoComplete="email"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white transition-all"
                        />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-gray-700 font-medium mb-2">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700"
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
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
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Recordarme
                                </label>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}
                        
                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transform hover:scale-[1.02] !mt-6"
                        >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cargando...
                            </span>
                        ) : (isLogin ? 'Entrar' : 'Crear Cuenta')}
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