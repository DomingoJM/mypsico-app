import React, { useState, useEffect, useContext, useCallback } from 'react';
import { PromoResource } from '../../../types'; // ✅ CAMBIADO: PromotionalItem → PromoResource
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import PromotionalItemModal from './PromotionalItemModal';
import { TrashIcon } from '../../../shared/Icons';

const PromotionalItemsManagement: React.FC = () => {
    const [items, setItems] = useState<PromoResource[]>([]); // ✅ CAMBIADO
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PromoResource | null>(null); // ✅ CAMBIADO
    const auth = useContext(AuthContext);

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await supabaseService.getPromotionalItems();
            setItems(data);
        } catch (err: unknown) {
            console.error("Failed to load promotional items:", err);
            let errorMessage = "No se pudieron cargar los ítems.";
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
        loadItems();
    }, [loadItems]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        loadItems();
    };
    
    const handleEdit = (item: PromoResource) => { // ✅ CAMBIADO
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item: PromoResource) => { // ✅ CAMBIADO
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.title}"?`)) {
            try {
                await supabaseService.deletePromotionalItem(item.id);
                setItems(current => current.filter(i => i.id !== item.id));
            } catch (err: unknown) {
                let errorMessage = "No se pudo eliminar el ítem.";
                if (err instanceof Error) {
                    errorMessage = err.message;
                } else if (err && typeof err === 'object' && 'message' in err) {
                    errorMessage = String((err as { message: string }).message);
                }
                setError(errorMessage);
            }
        }
    };

    const handleToggleActive = async (item: PromoResource) => { // ✅ CAMBIADO
        const currentlyActive = item.is_public; // ✅ CAMBIADO: is_active → is_public
        // Optimistic UI update
        setItems(items.map(i => i.id === item.id ? {...i, is_public: !currentlyActive} : {...i, is_public: false})); // ✅ CAMBIADO
        try {
            await supabaseService.updatePromotionalItem(item.id, { is_public: !currentlyActive }); // ✅ CAMBIADO
            // The service handles deactivating others, so we just reload to be safe
            loadItems();
        } catch (err: unknown) {
            let errorMessage = "No se pudo actualizar el estado del ítem.";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (err && typeof err === 'object' && 'message' in err) {
                errorMessage = String((err as { message: string }).message);
            }
            setError(errorMessage);
            loadItems(); // Revert on error
        }
    };


    if (loading) return <div>Cargando promociones...</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-brand-dark">Gestionar Promociones</h2>
                    <button
                        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                    >
                        Añadir Nuevo
                    </button>
                </div>

                {error && (
                    <div className="text-center mb-4 bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-bold text-red-800">Ocurrió un error</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                        <button onClick={loadItems} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            Reintentar Carga
                        </button>
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="p-3 font-semibold">Público</th> {/* ✅ CAMBIADO: Activo → Público */}
                                <th className="p-3 font-semibold">Imagen</th>
                                <th className="p-3 font-semibold">Título</th>
                                <th className="p-3 font-semibold">Tipo</th>
                                <th className="p-3 font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                                                checked={item.is_public} // ✅ CAMBIADO
                                                onChange={() => handleToggleActive(item)}
                                                title={item.is_public ? "Desactivar de la página principal" : "Mostrar en la página principal"} // ✅ CAMBIADO
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <img src={item.thumbnail_url || item.url} alt={item.title} className="w-24 h-14 object-cover rounded"/> {/* ✅ CAMBIADO: image_url → thumbnail_url || url */}
                                    </td>
                                    <td className="p-3 font-semibold">{item.title}</td>
                                    <td className="p-3 capitalize">{item.type}</td> {/* ✅ CAMBIADO: item_type → type */}
                                    <td className="p-3 space-x-3">
                                        <button onClick={() => handleEdit(item)} className="text-brand-primary hover:text-brand-dark font-semibold">Editar</button>
                                        <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1">
                                            <TrashIcon className="w-4 h-4"/> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {items.length === 0 && (
                        <p className="text-center text-slate-500 py-8">
                            No hay promociones. ¡Añade una para empezar!
                        </p>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <PromotionalItemModal
                    item={editingItem}
                    onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
};

export default PromotionalItemsManagement;
