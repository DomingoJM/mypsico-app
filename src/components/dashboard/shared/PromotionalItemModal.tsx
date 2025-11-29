import React, { useState, ChangeEvent, useContext, useRef } from 'react';
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import { CloseIcon, PhotoIcon, UploadIcon } from '../../../shared/Icons';
import { PromoResource } from '../../../types';

interface PromotionalItemModalProps {
    item: PromoResource | null;
    onClose: () => void;
    onSuccess: () => void;
}

const thematics = ['depresion', 'ansiedad', 'estres', 'problemas_pareja', 'adicciones', 'tab', 'fobias', 'crecimiento'];

const fileTypes = ['pdf', 'image', 'video', 'other'] as const;

const PromotionalItemModal: React.FC<PromotionalItemModalProps> = ({ item, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<PromoResource>>({
        title: item?.title || '',
        description: item?.description || '',
        file_url: item?.file_url || '',
        file_type: item?.file_type || 'pdf',
        is_public: item?.is_public || false,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(item?.thumbnail_url || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useContext(AuthContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!formData.title || !formData.file_url || (!imageFile && !item)) {
            setError("Título, URL del archivo e imagen son obligatorios.");
            return;
        }

        if (!auth?.user?.id) {
            setError("No se pudo identificar al autor. Por favor, inicia sesión de nuevo.");
            return;
        }
        
        setLoading(true);

        try {
            let imageUrl = item?.thumbnail_url || '';

            if (imageFile) {
                const filePath = `promotional_images/${Date.now()}_${imageFile.name}`;
                imageUrl = await supabaseService.uploadAppAsset(filePath, imageFile);
            }

            const dataToSave = {
                ...formData,
                thumbnail_url: imageUrl,
            };

            if (item) {
                await supabaseService.updatePromotionalItem(item.id, dataToSave);
            } else {
                await supabaseService.addPromotionalItem(
                    dataToSave as Omit<PromoResource, 'id' | 'created_at' | 'download_count'>,
                    auth.user.id
                );
            }
            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ocurrió un error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]" style={{ animationDuration: '0.3s' }}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-dark">{item ? 'Editar' : 'Añadir'} Recurso Promocional</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <main className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen Miniatura</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-brand-primary relative overflow-hidden group"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <PhotoIcon className="w-12 h-12 mx-auto" />
                                            <span className="text-sm">Subir imagen</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <UploadIcon className="w-8 h-8"/>
                                        <p>Cambiar imagen</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título</label>
                                    <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                                </div>
                                <div>
                                    <label htmlFor="file_type" className="block text-sm font-medium text-slate-700">Tipo de Archivo</label>
                                    <select name="file_type" id="file_type" value={formData.file_type} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md">
                                        {fileTypes.map(type => (
                                            <option key={type} value={type} className="capitalize">{type === 'pdf' ? 'PDF' : type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        name="is_public" 
                                        id="is_public" 
                                        checked={formData.is_public || false} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary"
                                    />
                                    <label htmlFor="is_public" className="ml-2 block text-sm font-medium text-slate-700">Hacer público (visible en home)</label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="file_url" className="block text-sm font-medium text-slate-700">URL del Archivo</label>
                            <input type="url" name="file_url" id="file_url" value={formData.file_url} onChange={handleChange} required placeholder="https://ejemplo.com/archivo.pdf" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
                    </main>
                    <footer className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end">
                        <button type="button" onClick={onClose} className="mr-3 px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:bg-slate-400">
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default PromotionalItemModal;