import React, { useState } from 'react';
import ConsentModal from '../consent/ConsentModal';

interface DailyContent {
  audio?: string;
  terapia?: string;
  meditacion?: string;
  cancion?: string;
  libro?: string;
  curso?: string;
}

const PublicHome: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [dailyContent] = useState<DailyContent>({
    audio: 'Meditación guiada de 10 minutos',
    terapia: 'Ejercicio de terapia cognitiva: Identificar pensamientos automáticos',
    meditacion: 'Meditación cristiana: Paz interior',
    cancion: 'Canción del día: "Paz en medio de la tormenta"',
    libro: 'Libro recomendado: "El poder del ahora"',
    curso: 'Curso del día: Manejo del estrés'
  });

  const handleEvaluationClick = () => {
    setShowConsent(true);
  };

  const handleConsentAccept = () => {
    // Cerrar modal y redirigir a registro
    setShowConsent(false);
    // Por ahora, solo cerramos el modal
    // Más adelante redirigiremos a la página de registro
    alert('¡Gracias por aceptar el consentimiento! Pronto podrás crear tu plan terapéutico.');
  };

  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-text">
      {/* Header con evaluación */}
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
              onClick={handleEvaluationClick}
              className="bg-brand-primary hover:bg-brand-dark text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition-colors"
            >
              📋 Empezar Evaluación
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
              <p className="text-gray-700 mb-4">{dailyContent.audio}</p>
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
              <p className="text-gray-700 mb-4">{dailyContent.terapia}</p>
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
              <p className="text-gray-700 mb-4">{dailyContent.meditacion}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-4 rounded-lg text-sm font-medium">
                  ▶️ Meditar
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>

            {/* Canción del día */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🎵</span>
                <h3 className="text-lg font-semibold">Canción del Día</h3>
              </div>
              <p className="text-gray-700 mb-4">{dailyContent.cancion}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-4 rounded-lg text-sm font-medium">
                  🎶 Escuchar
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
              <p className="text-gray-700 mb-4">{dailyContent.libro}</p>
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
              <p className="text-gray-700 mb-4">{dailyContent.curso}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-lg text-sm font-medium">
                  🎯 Iniciar
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm">
                  ✅
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Botones de contacto */}
        <section className="text-center">
          <h3 className="text-xl font-semibold mb-4">¿Necesitas apoyo adicional?</h3>
          <div className="flex justify-center gap-4">
            <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2">
              💬 Chat
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2">
              📱 WhatsApp
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2">
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