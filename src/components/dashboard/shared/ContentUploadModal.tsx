import React, { useState, ChangeEvent, useContext } from 'react';
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import { CloseIcon } from '../../../shared/Icons';
import { ContentItem, ContentType } from '../../../types/types';

interface ContentUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const spiritualPaths = ['Mindfulness', 'Meditación Cristiana', 'Psicoterapia'];
const pathologies = ['depresion', 'ansiedad', 'estres', 'problemas_pareja', 'adicciones', 'tab', 'fobias', 'crecimiento'];

const ContentUploadModal: React.FC<ContentUploadModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<Omit<ContentItem, 'id' | 'authorId'>>>({
        day: 1,
        type: ContentType.Video,
        content: ''
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useContext(AuthContext);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title || !formData.day || !formData.type || !formData.content) {
            setError("Por favor, completa los campos de título, día, tipo y URL.");
            return;
        }
        
        try {
            // Validar que la URL sea válida
            new URL(formData.content);
        } catch (_) {
            setError("La URL del contenido no es válida. Por favor, verifica el enlace.");
            return;
        }

        if (!auth?.user?.id) {
            setError("No se pudo identificar al autor. Por favor, inicia sesión de nuevo.");
            return;
        }
        
        setUploading(true);

        try {
            await supabaseService.addContent(
                {
                    day: Number(formData.day),
                    title: formData.title,
                    type: formData.type,
                    content: formData.content,
                    thumbnail_url: formData.thumbnail_url || undefined,
                    spiritual_path: formData.spiritual_path || undefined,
                    pathology: formData.pathology || undefined,
                },
                auth.user.id
            );
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ocurrió un error al guardar el contenido.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" style={{ animationDuration: '0.3s' }}>
                <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-brand-dark">Añadir Nuevo Contenido</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título</label>
                            <input type="text" name="title" id="title" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="day" className="block text-sm font-medium text-slate-700">Día del Plan</label>
                                <input type="number" name="day" id="day" value={formData.day} onChange={handleChange} required min="1" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            </div>
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo de Contenido</label>
                                <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md">
                                    {Object.values(ContentType).map(type => (
                                        <option key={type} value={type} className="capitalize">{type.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-slate-700">URL del Contenido</label>
                            <input type="url" name="content" id="content" onChange={handleChange} required placeholder="https://www.youtube.com/watch?v=..." className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            <p className="mt-1 text-xs text-slate-500">Pega aquí el enlace "No listado" de YouTube o el enlace para "Compartir" de un episodio de Spotify.</p>
                        </div>
                        
                        <div>
                            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-slate-700">URL de la Miniatura (Opcional)</label>
                            <input type="url" name="thumbnail_url" id="thumbnail_url" onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                            <p className="mt-1 text-xs text-slate-500">Si es un video de YouTube, se detectará automáticamente si dejas esto en blanco.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="spiritual_path" className="block text-sm font-medium text-slate-700">Senda Terapéutica (Opcional)</label>
                                <select name="spiritual_path" id="spiritual_path" value={formData.spiritual_path || ''} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md">
                                    <option value="">Ninguna</option>
                                    {spiritualPaths.map(path => <option key={path} value={path}>{path}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="pathology" className="block text-sm font-medium text-slate-700">Patología (Opcional)</label>
                                <select name="pathology" id="pathology" value={formData.pathology || ''} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md">
                                    <option value="">Ninguna</option>
                                    {pathologies.map(p => <option key={p} value={p} className="capitalize">{p.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
                    </main>
                    <footer className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end sticky bottom-0 z-10">
                        <button type="button" onClick={onClose} className="mr-3 px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={uploading} className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:bg-slate-400">
                            {uploading ? 'Guardando...' : 'Guardar Contenido'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ContentUploadModal;