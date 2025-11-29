import React, { useState, ChangeEvent, useContext, useRef } from 'react';
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import { CloseIcon, PhotoIcon, UploadIcon } from '../../../shared/Icons';
import { PromoResource, PromoResourceType } from '../../../types'; // ✅ CAMBIADO

interface PromotionalItemModalProps {
    item: PromoResource | null; // ✅ CAMBIADO
    onClose: () => void;
    onSuccess: () => void;
}

const thematics = ['depresion', 'ansiedad', 'estres', 'problemas_pareja', 'adicciones', 'tab', 'fobias', 'crecimiento'];

const PromotionalItemModal: React.FC<PromotionalItemModalProps> = ({ item, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<Partial<PromoResource>>({ // ✅ CAMBIADO
        title: item?.title || '',
        description: item?.description || '',
        url: item?.url || '', // ✅ CAMBIADO: external_link → url
        type: item?.type || PromoResourceType.Link, // ✅ CAMBIADO: item_type → type, Book → Link
        category: item?.category || '', // ✅ CAMBIADO: thematic → category
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(item?.thumbnail_url || null); // ✅ CAMBIADO
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useContext(AuthContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        
        if (!formData.title || !formData.url || (!imageFile && !item)) { // ✅ CAMBIADO
            setError("Título, enlace e imagen son obligatorios.");
            return;
        }

        if (!auth?.user?.id) {
            setError("No se pudo identificar al autor. Por favor, inicia sesión de nuevo.");
            return;
        }
        
        setLoading(true);

        try {
            let imageUrl = item?.thumbnail_url || ''; // ✅ CAMBIADO

            if (imageFile) {
                const filePath = `promotional_images/${Date.now()}_${imageFile.name}`;
                imageUrl = await supabaseService.uploadAppAsset(filePath, imageFile);
            }

            const dataToSave = {
                ...formData,
                thumbnail_url: imageUrl, // ✅ CAMBIADO
                category: formData.category || undefined, // ✅ CAMBIADO
            };

            if (item) {
                await supabaseService.updatePromotionalItem(item.id, dataToSave);
            } else {
                await supabaseService.addPromotionalItem(
                    dataToSave as Omit<PromoResource, 'id' | 'created_by' | 'created_at' | 'download_count'>, // ✅ CAMBIADO
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
                    <h2 className="text-xl font-bold text-brand-dark">{item ? 'Editar' : 'Añadir'} Promoción</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <main className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Imagen Promocional</label>
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
                                    <label htmlFor="type" className="block text-sm font-medium text-slate-700">Tipo</label>
                                    <select name="type" id="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md">
                                        {Object.values(PromoResourceType).map(type => (
                                            <option key={type} value={type} className="capitalize">{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoría (Opcional)</label>
                                    <select name="category" id="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary rounded-md">
                                        <option value="">General / Ninguna</option>
                                        {thematics.map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-slate-700">Enlace Externo (URL)</label>
                            <input type="url" name="url" id="url" value={formData.url} onChange={handleChange} required placeholder="https://amazon.com/mi-libro" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descripción Corta</label>
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