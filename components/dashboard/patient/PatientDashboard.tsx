import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ContentItem, PromotionalItem } from '../../../types';
import { supabaseService } from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import DailyPlanView from './DailyPlanView';
import ProgressReport from './ProgressReport';
import TodoList from './TodoList';
import Chatbot from '../../patient/Chatbot';
import ExternalSurveyScreen from '../../patient/ExternalSurveyScreen';
import { ChatIcon, WhatsAppIcon, CalendarIcon, SparklesIcon, CloseIcon, BookIcon, ShareIcon, CheckCircleIcon, ChartBarIcon } from '../../shared/Icons';
import ResourcesView from './ResourcesView';

// ====================================================================================
// ============================= ¡ACCIÓN REQUERIDA! =================================
//
// Reemplaza los siguientes enlaces con tu información de contacto.
// Esto permitirá a tus pacientes agendar consultas y contactarte fácilmente.
//
// 1. WHATSAPP_LINK: Tu enlace directo de WhatsApp (ej. 'https://wa.me/541112345678')
// 2. CALENDLY_LINK: Tu URL personal de Calendly (ej. 'https://calendly.com/tu-usuario')
// ====================================================================================
const WHATSAPP_LINK = 'https://wa.me/573180580919'; // <-- REEMPLAZA CON TU NÚMERO
const CALENDLY_LINK = 'https://calendly.com/domingo-jaimes'; // <-- REEMPLAZA CON TU LINK

const spiritualPaths = ['Mindfulness', 'Meditación Cristiana', 'Psicoterapia'];

const EvaluationPrompt: React.FC<{ onStart: () => void; onDismiss: () => void }> = ({ onStart, onDismiss }) => (
    <div className="bg-brand-secondary/20 border-l-4 border-brand-secondary p-6 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
        <div className="flex items-center gap-4">
            <SparklesIcon className="w-10 h-10 text-brand-secondary flex-shrink-0" />
            <div>
                <h2 className="text-xl font-bold text-brand-dark">Evaluación y Personalización</h2>
                <p className="text-brand-text mt-1">Realiza una evaluación externa y comparte tus resultados con nuestro asistente de IA para personalizar tu plan.</p>
            </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
            <button
                onClick={onStart}
                className="px-5 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
                Comenzar
            </button>
            <button
                onClick={onDismiss}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
                aria-label="Cerrar"
            >
                <CloseIcon className="w-5 h-5"/>
            </button>
        </div>
    </div>
);

const PromotionalItemCard: React.FC<{ item: PromotionalItem }> = ({ item }) => {
    const handleShare = async () => {
        const shareData = {
            title: `Recomendación de MYPSICO: ${item.title}`,
            text: `¡Hola! Te recomiendo este recurso que encontré en la app MYPSICO: "${item.title}".\n\n${item.description}`,
            url: item.external_link,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Error al compartir el contenido:', error);
                // User aborting the share action is not an error.
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                alert('No se pudo compartir el contenido.');
            }
        } else {
            alert('La función de compartir no es compatible con tu navegador. Puedes copiar el enlace manualmente.');
        }
    };

    return (
        <div className="relative rounded-xl shadow-lg mb-6 animate-fade-in-up overflow-hidden text-white">
            <img 
                src={item.image_url} 
                alt={`Imagen promocional de ${item.title}`} 
                className="absolute inset-0 w-full h-full object-cover" 
            />
            <div className="relative bg-gradient-to-r from-brand-dark/80 via-brand-dark/60 to-transparent p-6 sm:p-8 flex flex-col justify-center min-h-[200px]">
                <div className="max-w-lg">
                    <h2 className="text-2xl font-bold font-serif">Recomendación Especial: {item.title}</h2>
                    <p className="text-white/90 mt-2">{item.description}</p>
                    <div className="flex items-center gap-3 mt-4">
                        <a
                            href={item.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-brand-secondary text-brand-dark rounded-full font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            {item.item_type === 'libro' ? 'Ver Libro' : 'Ver Curso'}
                        </a>
                        <button
                            onClick={handleShare}
                            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                            aria-label="Compartir recurso"
                        >
                            <ShareIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

type ViewType = 'plan' | 'tasks' | 'report' | 'resources';

const tabs: { id: ViewType, label: string, icon: React.FC<{className?: string}> }[] = [
    { id: 'plan', label: 'Plan Diario', icon: CalendarIcon },
    { id: 'tasks', label: 'Mis Tareas', icon: CheckCircleIcon },
    { id: 'resources', label: 'Recursos', icon: BookIcon },
    { id: 'report', label: 'Mi Progreso', icon: ChartBarIcon },
];

const PatientDashboard: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [activePromo, setActivePromo] = useState<PromotionalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>('plan');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const auth = useContext(AuthContext);
  const [spiritualPath, setSpiritualPath] = useState(spiritualPaths[0]); // Default to first path
  const [showEvaluationScreen, setShowEvaluationScreen] = useState(false);
  const [showEvaluationPrompt, setShowEvaluationPrompt] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [contentData, promoData] = await Promise.all([
          supabaseService.getContent(),
          supabaseService.getActivePromotionalItem()
      ]);
      setContent(contentData);
      setActivePromo(promoData);
    } catch (err) {
      console.error("Error loading data:", err);
      let errorMessage = "No se pudo cargar el contenido. Intenta refrescar la página.";
      if (err instanceof Error) {
          errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
          errorMessage = String((err as { message: string }).message);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Sincroniza la senda espiritual desde el perfil del usuario cuando se carga.
    if (auth?.user?.spiritual_path) {
        setSpiritualPath(auth.user.spiritual_path);
    }
    // Show the evaluation prompt if the user profile indicates they haven't completed it.
    if (auth?.user && !auth.user.hasCompletedSurvey) {
        setShowEvaluationPrompt(true);
    } else {
        setShowEvaluationPrompt(false);
    }
  }, [auth?.user]);

  const handleDismissPrompt = async () => {
      setShowEvaluationPrompt(false); // Hide immediately for better UX.
      if (auth?.user) {
          try {
              // Persist this choice in the database for the user.
              await supabaseService.updateUser(auth.user.id, { hasCompletedSurvey: true });
          } catch (error) {
              console.error("Error updating survey completion status:", error);
              // The prompt might reappear on refresh if the update fails, which is acceptable fallback behavior.
          }
      }
  };

  const handlePathChange = async (path: string) => {
      const originalPath = spiritualPath;
      setSpiritualPath(path); // Optimistic UI update
      setError(null);
      if (auth?.user) {
        try {
          await supabaseService.updateUser(auth.user.id, { spiritual_path: path });
        } catch (err: unknown) {
            console.error("Failed to update spiritual path:", err);
            
            let errorMessage = "Ocurrió un error inesperado.";
            if (err && typeof err === 'object' && 'message' in err) {
                errorMessage = (err as { message: string }).message;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(`No se pudo guardar tu preferencia: ${errorMessage}`);
            setSpiritualPath(originalPath); // Revert on failure
        }
      }
  };

  if (showEvaluationScreen) {
      return <ExternalSurveyScreen onBack={() => setShowEvaluationScreen(false)} onChatOpen={() => {
          setShowEvaluationScreen(false);
          setIsChatOpen(true);
      }} />;
  }

  if (loading) return <div className="text-center p-8">Cargando tu plan diario...</div>;
  if (error) return (
    <div className="text-center p-8 bg-red-50 text-red-800 rounded-lg shadow-md border border-red-200">
        <h3 className="font-bold text-lg mb-2">Error al Cargar Tu Espacio</h3>
        <p>{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors">
            Intentar de Nuevo
        </button>
    </div>
  );

  const renderContent = () => {
    switch (view) {
        case 'plan':
            return (
                <div className="animate-fade-in-up">
                    <div className="mb-6 bg-brand-primary/5 p-4 rounded-lg border border-brand-primary/10">
                        <label htmlFor="spiritual-path" className="block text-sm font-medium text-slate-700 mb-2">Selecciona tu senda terapéutica:</label>
                        <select
                            id="spiritual-path"
                            value={spiritualPath}
                            onChange={(e) => handlePathChange(e.target.value)}
                            className="w-full sm:w-1/2 md:w-1/3 p-2 border border-slate-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                        >
                            {spiritualPaths.map(path => <option key={path} value={path}>{path}</option>)}
                        </select>
                    </div>
                    <DailyPlanView content={content} spiritualPath={spiritualPath} />
                    
                    <div className="mt-8 pt-6 border-t">
                        <h2 className="text-2xl font-bold font-serif text-brand-dark mb-4">Consultas</h2>
                        <p className="text-brand-text mb-6">¿Necesitas hablar con un profesional? Agenda una consulta con nosotros.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-transform transform hover:scale-105">
                                <WhatsAppIcon className="w-6 h-6" />
                                Contactar por WhatsApp
                            </a>
                            <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 bg-brand-secondary text-brand-dark rounded-lg font-semibold hover:opacity-90 transition-transform transform hover:scale-105">
                                <CalendarIcon className="w-6 h-6" />
                                Agendar Consulta
                            </a>
                        </div>
                    </div>
                </div>
            );
        case 'tasks':
            return <div className="animate-fade-in-up"><TodoList /></div>;
        case 'resources':
            return <div className="animate-fade-in-up"><ResourcesView /></div>;
        case 'report':
            return auth?.user ? <div className="animate-fade-in-up"><ProgressReport userId={auth.user.id} /></div> : null;
        default:
            return null;
    }
  };

  return (
    <div>
        {activePromo && <PromotionalItemCard item={activePromo} />}
        {showEvaluationPrompt && (
            <EvaluationPrompt
                onStart={() => setShowEvaluationScreen(true)}
                onDismiss={handleDismissPrompt}
            />
        )}
      
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
                <h1 className="text-3xl font-bold font-serif text-brand-dark">Tu Espacio de Bienestar</h1>
                <p className="text-brand-text mt-1">Aquí encontrarás tus actividades y recursos diarios para tu sanación.</p>
            </div>

            <div className="border-b border-slate-200 px-4 sm:px-6">
                <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            className={`relative inline-flex items-center gap-2 whitespace-nowrap py-3 px-3 sm:px-4 rounded-t-lg font-medium text-sm transition-colors ${view === tab.id ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                            aria-current={view === tab.id ? 'page' : undefined}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                            {view === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"></span>}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="p-6 bg-slate-50/50">
                {renderContent()}
            </div>
        </div>
     
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-brand-dark transition-transform transform hover:scale-110 z-30"
        aria-label="Abrir asistente virtual"
      >
        <ChatIcon className="w-8 h-8" />
      </button>

      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default PatientDashboard;