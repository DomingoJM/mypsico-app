import React, { useState, useEffect } from 'react';
import { contentService, DailyContent } from '../../services/contentService';
import ConsentModal from '../consent/ConsentModal';
import LoadingScreen from '../../components/shared/LoadingScreen';

const PublicHome: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [dailyContent, setDailyContent] = useState<DailyContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyContent = async () => {
      try {
        const content = await contentService.getDailyContent();
        setDailyContent(content);
      } catch (error) {
        console.error('Error fetching daily content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyContent();
  }, []);

  const handleLoginClick = () => {
    // Redirigir al formulario de autenticación
    window.location.href = '/auth';
  };

  const handleConsentAccept = () => {
    setShowConsent(false);
    window.location.href = '/auth';
  };

  const getContentDescription = (content: any) => {
    if (!content) return 'No hay contenido disponible para hoy.';
    return content.content || 'Sin descripción';
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-text">
      {/* Header con mensaje de login */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-brand-primary mb-4">
              Bienvenido a MyPsico
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Tu espacio para el crecimiento personal y bienestar emocional
            </p>
            <button
              onClick={handleLoginClick}
              className="bg-brand-primary hover:bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition-colors"
            >
              👤 ¿Eres terapeuta o paciente? Inicia sesión aquí
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Contenido del día */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">
            🌟 Contenido del Día
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Audio del día */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🎧</span>
                <h3 className="text-lg font-semibold">Audio del Día</h3>
              </div>
              <p className="text-gray-700 mb-4">{getContentDescription(dailyContent.audio)}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg text-sm font-medium">
                  ▶️ Escuchar
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>

            {/* Terapia del día */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🧠</span>
                <h3 className="text-lg font-semibold">Terapia del Día</h3>
              </div>
              <p className="text-gray-700 mb-4">{getContentDescription(dailyContent.terapia)}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded-lg text-sm font-medium">
                  📖 Ver
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>

            {/* Meditación del día */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🧘</span>
                <h3 className="text-lg font-semibold">Meditación del Día</h3>
              </div>
              <p className="text-gray-700 mb-4">{getContentDescription(dailyContent.meditacion)}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-4 rounded-lg text-sm font-medium">
                  ▶️ Meditar
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>

            {/* Video de sanación del día */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">✨</span>
                <h3 className="text-lg font-semibold">Video de Sanación</h3>
              </div>
              <p className="text-gray-700 mb-4">{getContentDescription(dailyContent.video_sanacion)}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 py-2 px-4 rounded-lg text-sm font-medium">
                  ▶️ Ver
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>

            {/* Libro del día */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">📚</span>
                <h3 className="text-lg font-semibold">Libro del Día</h3>
              </div>
              <p className="text-gray-700 mb-4">Explora nuestra selección de libros recomendados.</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 px-4 rounded-lg text-sm font-medium">
                  📖 Ver
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>

            {/* Curso del día */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🎓</span>
                <h3 className="text-lg font-semibold">Curso del Día</h3>
              </div>
              <p className="text-gray-700 mb-4">Descubre nuestros cursos especializados.</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-lg text-sm font-medium">
                  🎯 Explorar
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Botones de contacto - FUNCIONALES PARA PRODUCCIÓN */}
        <section className="text-center mt-12">
          <h3 className="text-xl font-semibold mb-4">¿Necesitas apoyo adicional?</h3>
          <div className="flex justify-center gap-4">
            {/* Botón de Chat - ACTUALIZADO */}
            <button 
              onClick={() => window.open('https://your-chat-url.com', '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              💬 Chat
            </button>

            {/* Botón de WhatsApp - ACTUALIZADO */}
            <button 
              onClick={() => window.open('https://wa.me/573180580919', '_blank')}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              📱 WhatsApp
            </button>

            {/* Botón de Calendly - ACTUALIZADO */}
            <button 
              onClick={() => window.open('https://calendly.com/domingo-jaimes', '_blank')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              📅 Agendar Cita
            </button>
          </div>
        </section>
      </main>

      {/* Modal de consentimiento */}
      <ConsentModal 
        isOpen={showConsent} 
        onClose={() => setShowConsent(false)} 
        onAccept={handleConsentAccept}
      />
    </div>
  );
};

export default PublicHome;