import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  category: string;
}

export default function VisitorHome() {
  const [scrollY, setScrollY] = useState(0);
  const [featuredContents, setFeaturedContents] = useState<FeaturedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    loadFeaturedContent();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadFeaturedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setFeaturedContents(data || []);
    } catch (error) {
      console.error('Error loading featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      video: '🎥',
      audio: '🎧',
      article: '📄',
      exercise: '🧘'
    };
    return icons[type] || '📦';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }
      `}</style>

      {/* Header con logo */}
      <header className="w-full py-6 px-6 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/icon-512.png" alt="MyPsico" className="h-14 opacity-90" />
          <span className="font-serif text-2xl text-gray-700 tracking-wide">MyPs<span style={{fontSize: '0.75em'}}>Ψ</span>co</span>
        </div>
        <Link 
          to="/login" 
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium shadow-md transition-all hover:shadow-lg"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero Section */}
      <section className="w-full text-center py-20 px-6 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.3}px)`
          }}
        ></div>
        
        <div className="relative z-10 max-w-4xl mx-auto fade-in-up">
          <h1 className="text-5xl md:text-6xl font-serif text-gray-800 mb-6 leading-tight">
            Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">MyPs<span style={{fontSize: '0.75em'}}>Ψ</span>co</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light mb-8 max-w-3xl mx-auto">
            Tu espacio para el crecimiento personal y el bienestar emocional
          </p>
          
          <Link 
            to="/login"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full text-lg font-semibold shadow-xl transition-all hover:shadow-2xl hover:scale-105"
          >
            Si eres paciente o terapeuta haz clic aquí
          </Link>
        </div>
      </section>

      {/* Contenido destacado del día */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-4">
          Contenido destacado de hoy
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Contenido especialmente seleccionado para tu proceso de sanación
        </p>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : featuredContents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <p className="text-gray-500">No hay contenido destacado disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredContents.map((content, i) => (
              <div 
                key={content.id}
                className="bg-white rounded-2xl shadow-lg hover-lift border border-gray-100 overflow-hidden fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {content.thumbnail && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={content.thumbnail} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getTypeIcon(content.type)}</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {content.category}
                    </span>
                    {content.duration && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {content.duration} min
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{content.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  <Link 
                    to="/login"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                  >
                    Inicia sesión para ver <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">¿Quieres acceder a todo nuestro contenido?</p>
          <Link 
            to="/login"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            Entrar al proceso
          </Link>
        </div>
      </section>

      {/* Cards informativas */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Respira • Presencia", icon: "🌸", color: "from-pink-400 to-rose-500", delay: "0s" },
            { title: "Conócete • Integra", icon: "💜", color: "from-purple-400 to-indigo-500", delay: "0.1s" },
            { title: "Cura • Crece", icon: "✨", color: "from-blue-400 to-cyan-500", delay: "0.2s" }
          ].map((item, i) => (
            <div 
              key={i}
              className="bg-white rounded-2xl p-8 shadow-lg hover-lift border border-gray-100 fade-in-up text-center"
              style={{ animationDelay: item.delay }}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-4 mx-auto float-animation`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de apoyo */}
      <section className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-serif mb-4">
          ¿Necesitas apoyo adicional?
        </h2>
        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
          Estamos aquí para acompañarte en cada paso de tu camino
        </p>
        
        <div className="flex justify-center gap-6 flex-wrap">
          <a 
            href="https://wa.me/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-6 min-w-[140px] transition-all hover:scale-105"
          >
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-2xl">
              💬
            </div>
            <span className="font-medium">WhatsApp</span>
          </a>
          
          <a 
            href="https://calendar.google.com/calendar/u/0/r/eventedit?text=Cita%20con%20MyPsico&details=Solicito%20agendar%20una%20cita%20para%20acompañamiento%20terapéutico&add=djmpsicologo@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-6 min-w-[140px] transition-all hover:scale-105"
          >
            <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-2xl">
              📅
            </div>
            <span className="font-medium">Agendar cita</span>
          </a>
          
          <button className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-6 min-w-[140px] transition-all hover:scale-105">
            <div className="w-14 h-14 bg-gray-500 rounded-full flex items-center justify-center text-2xl">
              💭
            </div>
            <span className="font-medium">Chatbot</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-6 bg-gray-50 text-center text-gray-600 border-t border-gray-200">
        <p className="text-sm">
          © 2025 MyPs<span style={{fontSize: '0.75em'}}>Ψ</span>co - Tu espacio para sanar
        </p>
      </footer>
    </div>
  );
}
