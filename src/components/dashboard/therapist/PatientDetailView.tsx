import React, { useState, useEffect } from 'react';
import { User, ActivityLog } from '../../../types';
import * as supabaseService from '../../../services/supabaseService';

interface PatientDetailViewProps {
    patient: User;
    onBack: () => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-50 p-4 rounded-lg border">
        <h4 className="font-semibold text-brand-dark mb-2">{title}</h4>
        <div className="text-slate-700 prose prose-sm max-w-none">{children}</div>
    </div>
);

const ActivityLogCard: React.FC<{ log: ActivityLog }> = ({ log }) => {
    const formattedDate = new Date(log.created_at).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const ratingStars = '★'.repeat(log.rating || 0) + '☆'.repeat(5 - (log.rating || 0));

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-brand-dark">{log.content?.title || 'Actividad Desconocida'}</h4>
                    <p className="text-sm text-slate-500">{formattedDate}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg text-yellow-500">{ratingStars}</p>
                    <p className="text-sm text-slate-500">Calificación</p>
                </div>
            </div>
            {log.reflection && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap">{log.reflection}</p>
                </div>
            )}
        </div>
    );
};

const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, onBack }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await supabaseService.getActivityLogsForPatient(patient.id);
                setLogs(data);
            } catch (err) {
                console.error("Failed to fetch activity logs:", err);
                setError("No se pudieron cargar los registros de actividad.");
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [patient.id]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up">
             <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
                <span className="text-lg">&larr;</span> Volver a la lista
             </button>

            {/* Patient Header */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                 <img
                    src={patient.photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${patient.name}`}
                    alt={patient.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                 />
                 <div className="pt-2">
                    <h2 className="text-3xl font-bold text-brand-dark">{patient.name}</h2>
                    <p className="text-slate-500 text-lg">{patient.email}</p>
                     {patient.dsm_v_diagnosis && (
                        <p className="mt-2 text-md font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full inline-block">{patient.dsm_v_diagnosis}</p>
                     )}
                 </div>
            </div>

            {/* Clinical Information */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-brand-dark mb-4 border-b pb-2">Información Clínica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="Historia Familiar">{patient.family_history || 'No especificada.'}</InfoCard>
                    <InfoCard title="Figuras Significativas">{patient.significant_figures || 'No especificadas.'}</InfoCard>
                    <InfoCard title="Eventos Traumáticos">{patient.traumatic_events || 'No especificados.'}</InfoCard>
                    <InfoCard title="Seguimiento y Control">{patient.follow_up_and_control || 'No especificado.'}</InfoCard>
                    <InfoCard title="Plan de Tratamiento">{patient.treatment_plan || 'No especificado.'}</InfoCard>
                </div>
            </div>

            {/* Activity Logs */}
            <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-brand-dark mb-4">Registro de Actividades</h3>
                {loading && <p>Cargando registros...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!loading && !error && logs.length === 0 && (
                    <p className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg">
                        Este paciente aún no ha completado ninguna actividad.
                    </p>
                )}
                
                {!loading && logs.length > 0 && (
                    <div className="space-y-4">
                        {logs.map(log => (
                            <ActivityLogCard key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDetailView;