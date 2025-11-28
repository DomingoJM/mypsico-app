import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ContentItem, ContentType } from '../../../types/types';
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import ContentUploadModal from './ContentUploadModal'; // Importar el nuevo modal
import { CloseIcon } from '../../../shared/Icons';

// New Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
    item: ContentItem;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}> = ({ item, onClose, onConfirm, isDeleting }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ animationDuration: '0.3s' }}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-accent">Confirmar Eliminación</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100" disabled={isDeleting}>
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <main className="p-6">
                    <p className="text-slate-700 text-lg">
                        ¿Estás seguro de que quieres eliminar el contenido <strong className="text-brand-dark">"{item.title}"</strong>?
                    </p>
                    <p className="mt-2 text-sm text-red-600 font-semibold">
                        Esta acción es irreversible y no se puede deshacer.
                    </p>
                </main>
                <footer className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition-colors disabled:bg-slate-200 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-brand-accent text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const ContentManagement: React.FC = () => {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useContext(AuthContext);

    // State for deletion confirmation
    const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadContent = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await supabaseService.getContent();
            setContent(data);
        } catch (error: unknown) {
            console.error("Failed to load content:", error);
            let errorMessage = "No se pudo cargar el contenido.";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String((error as { message: string }).message);
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    const handleUploadSuccess = () => {
        setIsModalOpen(false);
        loadContent(); // Recargar el contenido para mostrar el nuevo item
    };

    // Opens the confirmation modal
    const handleDeleteRequest = (item: ContentItem) => {
        setItemToDelete(item);
    };

    // Performs the actual deletion
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        setError(null);
        try {
            await supabaseService.deleteContent(itemToDelete.id);
            // Actualizar la UI al instante sin recargar toda la lista desde la BD
            setContent(currentContent => currentContent.filter(item => item.id !== itemToDelete.id));
        } catch (err: any) {
            console.error("Failed to delete content:", err);
            let detailedError = err.message || "No se pudo eliminar el contenido.";
            if (err.message && err.message.toLowerCase().includes('violates row-level security policy')) {
                detailedError = "Error de permisos: La base de datos ha bloqueado esta acción. Revisa las políticas de seguridad (RLS) para la tabla 'content' en tu panel de Supabase.";
            }
            setError(detailedError);
        } finally {
            setIsDeleting(false);
            setItemToDelete(null); // Close modal
        }
    };

    // FIX: Use `originalUser` for permission checks to ensure admins can always manage content, even when simulating other roles.
    const canManageContent = auth?.originalUser?.role === 'admin' || auth?.originalUser?.role === 'terapeuta';

    if (loading) return <div>Cargando contenido...</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-brand-dark">Gestión de Contenido</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors">
                        Subir Nuevo Contenido
                    </button>
                </div>

                {error && (
                    <div className="text-center mb-4 bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-bold text-red-800">Ocurrió un error</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                         <button onClick={loadContent} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            Reintentar Carga
                        </button>
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="p-3 font-semibold">Día</th>
                                <th className="p-3 font-semibold">Título</th>
                                <th className="p-3 font-semibold">Tipo</th>
                                <th className="p-3 font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {content.map(item => (
                                <tr key={item.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3">{item.day}</td>
                                    <td className="p-3">{item.title}</td>
                                    <td className="p-3 capitalize">{item.type}</td>
                                    <td className="p-3">
                                        <button 
                                            onClick={() => handleDeleteRequest(item)}
                                            disabled={!canManageContent}
                                            className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            title={canManageContent ? "Eliminar contenido" : "No tienes permisos para eliminar"}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {content.length === 0 && (
                         <p className="text-center text-slate-500 py-8">
                            No hay contenido disponible. ¡Sube algo para empezar!
                        </p>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <ContentUploadModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {itemToDelete && (
                <DeleteConfirmationModal
                    item={itemToDelete}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
};

export default ContentManagement;
