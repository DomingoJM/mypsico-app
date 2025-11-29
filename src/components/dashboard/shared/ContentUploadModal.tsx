import React, { useState, ChangeEvent, useContext } from 'react';
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import { CloseIcon } from '../../../shared/Icons';
import { Content, ContentType, ContentStatus } from '../../../types'; // ✅ CAMBIADO

interface ContentUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const categories = ['Mindfulness', 'Meditación', 'Psicoterapia', 'Desarrollo Personal', 'Espiritualidad'];

const ContentUploadModal: React.FC<ContentUploadModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<Content>>({ // ✅ CAMBIADO
        title: '',
        description: '',
        type: ContentType.Video,
        url: '', // ✅ CAMBIADO: content → url
        thumbnail_url: '',
        category: '',
        featured: false,
        status: ContentStatus.Active
    });
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useContext(AuthContext);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title || !formData.type || !formData.url) { // ✅ CAMBIADO
            setError("Por favor, completa los campos de título, tipo y URL.");
            return;
        }
        
        try {
            // Validar que la URL sea válida
            new URL(formData.url); // ✅ CAMBIADO
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
            await supabaseService.addContent({ // ✅ CAMBIADO
                title: formData.title!,
                description: formData.description || '',
                type: formData.type!,
                url: formData.url!, // ✅ CAMBIADO
                thumbnail_url: formData.thumbnail_url || undefined,
                category: formData.category || 'General',
                featured: formData.featured || false,
                status: formData.status || ContentStatus.Active,
                created_by: auth.user.id // ✅ AGREGADO
            });
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
                            <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                value={formData.title}
                                onChange={handleChange} 
                                required 
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" 
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción</label>
                            <textarea 
                                name="description" 
                                id="description" 
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo de Contenido</label>
                                <select 
                                    name="type" 
                                    id="type" 
                                    value={formData.type} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md"
                                >
                                    {Object.values(ContentType).map(type => (
                                        <option key={type} value={type} className="capitalize">{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoría</label>
                                <select 
                                    name="category" 
                                    id="category" 
                                    value={formData.category || ''} 
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md"
                                >
                                    <option value="">General</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-slate-700">URL del Contenido</label>
                            <input 
                                type="url" 
                                name="url" 
                                id="url" 
                                value={formData.url}
                                onChange={handleChange} 
                                required 
                                placeholder="https://www.youtube.com/watch?v=..." 
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" 
                            />
                            <p className="mt-1 text-xs text-slate-500">Pega aquí el enlace de YouTube, Spotify, o cualquier recurso multimedia.</p>
                        </div>
                        
                        <div>
                            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-slate-700">URL de la Miniatura (Opcional)</label>
                            <input 
                                type="url" 
                                name="thumbnail_url" 
                                id="thumbnail_url" 
                                value={formData.thumbnail_url}
                                onChange={handleChange} 
                                placeholder="https://ejemplo.com/imagen.jpg" 
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" 
                            />
                            <p className="mt-1 text-xs text-slate-500">Si es un video de YouTube, se detectará automáticamente si dejas esto en blanco.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Estado</label>
                                <select 
                                    name="status" 
                                    id="status" 
                                    value={formData.status || ContentStatus.Active} 
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md"
                                >
                                    {Object.values(ContentStatus).map(status => (
                                        <option key={status} value={status} className="capitalize">{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center pt-6">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    id="featured"
                                    checked={formData.featured || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                                />
                                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                                    Destacar este contenido
                                </label>
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