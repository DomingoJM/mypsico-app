import React, { useContext, useState, useEffect } from 'react';
import { ContentItem, ContentType, ActivityLog, User } from '../../../types';
import { VideoIcon, AudioIcon, TextIcon, CheckCircleIcon, ShareIcon, CloseIcon, PlayCircleIcon } from '../../shared/Icons';
import { AuthContext } from '../../../App';
import { supabaseService } from '../../../services/supabaseService';
import ContentPlayerModal from './ContentPlayerModal';

const MoodTrackerInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    colorClass: string;
}> = ({ label, value, onChange, colorClass }) => {
    const labels: { [key: string]: string[] } = {
        mood: ['Muy bajo', 'Bajo', 'Neutral', 'Bueno', 'Excelente'],
        anxiety: ['Inexistente', 'Leve', 'Moderada', 'Alta', 'Muy Alta'],
        stress: ['Inexistente', 'Leve', 'Moderado', 'Alto', 'Muy Alto']
    };
    const key = label.toLowerCase().includes('nimo') ? 'mood' : (label.toLowerCase().includes('ansiedad') ? 'anxiety' : 'stress');
    
    return (
        <div>
            <label className="block text-slate-700 font-medium mb-2 text-center">{label}</label>
            <div className="relative px-2">
                <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value, 10))}
                    className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer custom-slider`}
                />
                 <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                </div>
            </div>
            <p className={`text-center font-semibold mt-2 ${colorClass}`}>{labels[key][value - 1]}</p>
        </div>
    );
};


const CompletionModal: React.FC<{ item: ContentItem; onClose: () => void; onComplete: (log: ActivityLog) => void }> = ({ item, onClose, onComplete }) => {
    const [mood, setMood] = useState(3);
    const [anxiety, setAnxiety] = useState(3);
    const [stress, setStress] = useState(3);
    const [reflection, setReflection] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const auth = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.user) return;
        setSubmitting(true);
        setError('');
        try {
            const newLog = await supabaseService.logActivityCompletion({
                userId: auth.user.id,
                contentId: item.id,
                reflection,
                mood,
                anxiety,
                stress,
            });
            onComplete(newLog);
            onClose();
        } catch (err) {
            console.error(err);
            setError('No se pudo guardar tu reflexión. Inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ animationDuration: '0.3s' }}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-dark">Completar Actividad</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <form onSubmit={handleSubmit}>
                    <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                        <div>
                           <p className="text-lg text-slate-700 mb-6 text-center">Registra cómo te sientes después de <strong className="text-brand-primary">{item.title}</strong>.</p>
                            <div className="space-y-6">
                                <MoodTrackerInput label="Estado de Ánimo" value={mood} onChange={setMood} colorClass="text-brand-primary" />
                                <MoodTrackerInput label="Nivel de Ansiedad" value={anxiety} onChange={setAnxiety} colorClass="text-brand-secondary" />
                                <MoodTrackerInput label="Nivel de Estrés" value={stress} onChange={setStress} colorClass="text-brand-accent" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="reflection" className="block text-lg text-slate-700 font-medium mb-2 text-center">¿Alguna reflexión que quieras guardar?</label>
                            <textarea
                                id="reflection"
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                rows={4}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                placeholder="Escribe aquí tus pensamientos..."
                            />
                        </div>
                         {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    </main>
                    <footer className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:bg-slate-400"
                        >
                            {submitting ? 'Guardando...' : 'Guardar Reflexión'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


const ContentCard: React.FC<{ item: ContentItem; isCompleted: boolean; onOpenClick: (item: ContentItem) => void; }> = ({ item, isCompleted, onOpenClick }) => {

    const getYoutubeThumbnail = (url: string): string | null => {
        try {
            const urlObj = new URL(url);
            let videoId;
            if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1).split('?')[0];
            } else {
                videoId = urlObj.searchParams.get('v');
            }
            return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
        } catch {
            return null;
        }
    };

    const thumbnailUrl = item.thumbnail_url || (item.type === 'video' ? getYoutubeThumbnail(item.content) : 'https://images.unsplash.com/photo-1508669232494-837e40342c42?q=80&w=2832&auto=format&fit=crop');

    const getIcon = () => {
        switch (item.type) {
            case ContentType.Video: return <VideoIcon className="w-5 h-5" />;
            case ContentType.Audio: return <AudioIcon className="w-5 h-5" />;
            case ContentType.Text: return <TextIcon className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <div className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col bg-white overflow-hidden group">
            <div className="relative aspect-video w-full">
                <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {!isCompleted && item.type !== ContentType.Text && (
                    <button onClick={() => onOpenClick(item)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Abrir ${item.title}`}>
                        <PlayCircleIcon className="w-16 h-16 text-white/80 drop-shadow-lg" />
                    </button>
                )}

                {isCompleted && (
                    <div className="absolute inset-0 bg-brand-light/80 flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                            <CheckCircleIcon className="w-6 h-6"/>
                            <span>Completado</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    {getIcon()}
                    <span className="capitalize">{item.type}</span>
                </div>
                <h3 className="text-lg font-bold text-brand-dark flex-grow">{item.title}</h3>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <button
                        onClick={() => onOpenClick(item)}
                        disabled={isCompleted}
                        className="px-4 py-2 text-white rounded-lg font-semibold text-sm transition-colors bg-brand-primary hover:bg-brand-dark disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        {isCompleted ? 'Visto' : (item.type === 'texto' ? 'Leer Ahora' : 'Ver Contenido')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DailyPlanView: React.FC<{ content: ContentItem[]; spiritualPath: string }> = ({ content, spiritualPath }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user as User | null;
  const [modalItem, setModalItem] = useState<ContentItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
        if (user) {
            const logs = await supabaseService.getActivityLogsForPatient(user.id);
            setActivityLogs(logs);
        }
    };
    fetchLogs();
  }, [user]);


  const todayContent = content.filter(item => {
    // FIX: Temporarily show all content from day 1 for demonstration, regardless of path or condition.
    // This ensures a user sees a full plan without needing a profile setup, improving the initial experience.
    // In production, the commented-out logic should be restored.
    if (item.day !== 1) return false;
    return true;
    
    /*
    const isGeneral = !item.pathology && !item.spiritual_path;
    const matchesCondition = user?.primary_condition && item.pathology && item.pathology === user.primary_condition;
    const matchesPath = item.spiritual_path && item.spiritual_path === spiritualPath;

    // Show content if it's general, or if it matches the user's condition or selected path.
    return isGeneral || matchesCondition || matchesPath;
    */
  });

  const handleOpenContent = (item: ContentItem) => {
    setViewingItem(item);
  };

  const handleClosePlayer = () => {
    setViewingItem(null);
  };

  const handleStartCompletion = (item: ContentItem) => {
    setViewingItem(null); // Cierra el reproductor
    setModalItem(item);   // Abre el modal de completado
  };
  
  const handleLogCompletion = (log: ActivityLog) => {
    setActivityLogs(prevLogs => [...prevLogs, log]);
  };
  
  const handleModalClose = () => {
    setModalItem(null);
  };

  const completedContentIds = new Set(activityLogs.map(log => log.content_id));

  return (
    <div>
        <h2 className="text-2xl font-bold font-serif text-brand-dark mb-4">Plan para Hoy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayContent.length > 0 ? (
                todayContent.map(item => (
                    <ContentCard 
                        key={item.id} 
                        item={item} 
                        isCompleted={completedContentIds.has(item.id)}
                        onOpenClick={handleOpenContent}
                    />
                ))
            ) : (
                <p>No hay actividades para hoy. ¡Disfruta de tu día!</p>
            )}
        </div>
        
        {viewingItem && (
             <ContentPlayerModal
                item={viewingItem}
                onClose={handleClosePlayer}
                onMarkComplete={handleStartCompletion}
            />
        )}

        {modalItem && (
            <CompletionModal
                item={modalItem}
                onClose={handleModalClose}
                onComplete={handleLogCompletion}
            />
        )}
    </div>
  );
};

export default DailyPlanView;