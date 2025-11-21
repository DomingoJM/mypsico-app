import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { supabaseService } from '../../../services/supabaseService';
import DailyPlanView from './DailyPlanView';
import TodoList from './TodoList';
import Journal from '../../patient/Journal'; 
import ProgressReport from './ProgressReport';
import { WhatsAppIcon, CalendarPlusIcon } from '../../shared/Icons';

const PatientMainView: React.FC = () => {
  const auth = useContext(AuthContext);
  const [view, setView] = useState('plan');
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      let mounted = true;
      
      const fetchContent = async () => {
        if (!auth?.user?.id) {
            setLoading(false);
            return;
        }

        try {
            const data = await supabaseService.getContent();
            if (mounted) setContent(data);
        } catch (err: any) {
            console.error("Error loading content:", err);
            if (mounted) setError("Modo sin conexión. Recarga para ver nuevo contenido.");
        } finally {
            if (mounted) setLoading(false);
        }
      };

      fetchContent();
      return () => { mounted = false; };
  }, [auth?.user?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const handleWhatsApp = () => {
      // Reemplaza con tu número real o lógica de contacto
      window.open('https://wa.me/573000000000?text=Hola%20necesito%20soporte%20en%20MyPsico', '_blank');
  };

  const handleSchedule = () => {
      // Reemplaza con tu link de Calendly o similar
      window.open('https://calendly.com/', '_blank'); 
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white min-h-screen animate-fade-in-up pb-32">
        {/* Header Principal */}
        <header className="mb-8 flex flex-col items-start gap-1">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{greeting}</span>
            <h1 className="text-3xl sm:text-4xl font-light text-black tracking-tight">
                {auth?.user?.name?.split(' ')[0]}
            </h1>
            <div className="h-1 w-12 bg-brand-accent mt-2 rounded-full"></div>
        </header>

        {/* Botones de Acción Rápida (WhatsApp y Agendar) */}
        <div className="grid grid-cols-2 gap-4 mb-10">
            <button 
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-3 p-5 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-green-200 transition-all group"
            >
                <div className="bg-green-50 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <WhatsAppIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Soporte</span>
                    <span className="block text-sm font-bold text-slate-800 group-hover:text-green-700">WhatsApp</span>
                </div>
            </button>

            <button 
                onClick={handleSchedule}
                className="flex items-center justify-center gap-3 p-5 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
            >
                <div className="bg-blue-50 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <CalendarPlusIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citas</span>
                    <span className="block text-sm font-bold text-slate-800 group-hover:text-blue-700">Agendar</span>
                </div>
            </button>
        </div>

        {/* Banner de Progreso (Evaluación) */}
        <div className="mb-10">
            <ProgressReport userId={auth?.user?.id || ''} />
        </div>

        {/* Navegación (Tabs) */}
        <nav className="flex justify-start gap-8 mb-8 border-b border-gray-100 pb-px overflow-x-auto scrollbar-hide">
            {[
                { id: 'plan', label: 'Mi Plan de Hoy' },
                { id: 'journal', label: 'Diario Personal' },
                { id: 'tasks', label: 'Tareas' }
            ].map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => setView(tab.id)} 
                    className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                        view === tab.id 
                        ? 'border-b-2 border-black text-black' 
                        : 'text-gray-400 hover:text-gray-600 border-transparent'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>

        {/* Área de Contenido */}
        <div className="min-h-[300px] animate-fade-in-up">
            {view === 'plan' && (
                <div className="space-y-10">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-40 bg-slate-50 rounded-lg w-full"></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="h-64 bg-slate-50 rounded-lg"></div>
                                <div className="h-64 bg-slate-50 rounded-lg"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-8 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl text-sm text-center flex flex-col items-center">
                             <p>{error}</p>
                        </div>
                    ) : (
                        <DailyPlanView content={content} spiritualPath={auth?.user?.spiritual_path || 'Mindfulness'} />
                    )}
                </div>
            )}
            {view === 'journal' && <Journal />}
            {view === 'tasks' && <TodoList />}
        </div>
    </div>
  );
};

export default PatientMainView;