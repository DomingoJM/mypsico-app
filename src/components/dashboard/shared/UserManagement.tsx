import React, { useState, useEffect, useContext, useCallback } from 'react';
import { User, Role } from '../../../types/types';
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import CreatePatientModal from './CreatePatientModal';
import { CloseIcon } from '../../../shared/Icons';

interface UserManagementProps {
    manageableRole: Role.Admin | Role.Patient;
    onSelectPatient?: (patient: User) => void;
}

// New Confirmation Modal Component for Users
const UserDeleteConfirmationModal: React.FC<{
    user: User;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}> = ({ user, onClose, onConfirm, isDeleting }) => {
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
                        ¿Estás seguro de que quieres eliminar al usuario <strong className="text-brand-dark">"{user.name}"</strong>?
                    </p>
                    <p className="mt-2 text-sm text-red-600 font-semibold">
                        Esta acción es irreversible y eliminará su perfil y todos sus datos asociados de la plataforma.
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


const UserManagement: React.FC<UserManagementProps> = ({ manageableRole, onSelectPatient }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const auth = useContext(AuthContext);
    
    // State for deletion confirmation
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (manageableRole === Role.Admin) {
                data = await supabaseService.getUsers();
            } else if (auth?.user?.id) {
                data = await supabaseService.getPatientsForTherapist(auth.user.id);
            }
            setUsers(data || []);
        } catch (error: unknown) {
            console.error("Failed to load users:", error);
            let errorMessage = "No se pudieron cargar los usuarios.";
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String((error as { message: string }).message);
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [manageableRole, auth?.user?.id]);
    
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);
    
    // Opens the confirmation modal
    const handleDeleteRequest = (user: User) => {
        setUserToDelete(user);
    };

    // Performs the actual deletion
    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        setError(null);
        try {
            await supabaseService.deleteUser(userToDelete.id);
            // Update UI instantly without reloading the entire list from DB
            setUsers(currentUsers => currentUsers.filter(user => user.id !== userToDelete.id));
        } catch (err: any) {
             console.error("Failed to delete user:", err);
             let detailedError = err.message || "No se pudo eliminar el usuario.";
             if (err.message && err.message.toLowerCase().includes('violates row-level security policy')) {
                detailedError = "Error de permisos: La base de datos ha bloqueado esta acción. Revisa las políticas de seguridad (RLS) para la tabla 'profiles' en tu panel de Supabase.";
             }
             setError(detailedError);
        } finally {
            setIsDeleting(false);
            setUserToDelete(null); // Close modal
        }
    };

    const handlePatientCreated = () => {
        setIsCreateModalOpen(false);
        loadUsers(); // Recargar la lista de usuarios
    };

    if (loading) return <div>Cargando usuarios...</div>;

    const isTherapistView = manageableRole === Role.Patient;
    const buttonText = isTherapistView ? 'Registrar Paciente' : 'Crear Nuevo Usuario';

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-brand-dark">
                        {manageableRole === Role.Admin ? 'Todos los Usuarios' : 'Mis Pacientes'}
                    </h2>
                     <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                     >
                        {buttonText}
                    </button>
                </div>

                {error && (
                    <div className="text-center mb-4 bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-bold text-red-800">Ocurrió un error</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                        <button onClick={loadUsers} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            Reintentar Carga
                        </button>
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="p-3 font-semibold">Nombre</th>
                                <th className="p-3 font-semibold">Email</th>
                                <th className="p-3 font-semibold">
                                    {isTherapistView ? 'Condición Primaria' : 'Rol'}
                                </th>
                                <th className="p-3 font-semibold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3 flex items-center gap-3">
                                        <img src={user.photo_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                                        <span>{user.name}</span>
                                    </td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3 capitalize">
                                        {isTherapistView ? (user.primary_condition || 'No especificada') : user.role}
                                    </td>
                                    <td className="p-3 space-x-4">
                                        {isTherapistView && onSelectPatient && (
                                            <button 
                                                onClick={() => onSelectPatient(user)}
                                                className="text-brand-primary hover:text-brand-dark font-semibold"
                                            >
                                                Ver Reporte
                                            </button>
                                        )}
                                        {auth?.originalUser?.role === Role.Admin && (
                                            <button 
                                              onClick={() => handleDeleteRequest(user)}
                                              disabled={auth.user?.id === user.id}
                                              className="text-red-600 hover:text-red-800 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                                              title={auth.user?.id === user.id ? "No puedes eliminar tu propia cuenta" : ""}
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {users.length === 0 && (
                        <p className="text-center text-slate-500 py-8">
                            {isTherapistView ? "No tienes pacientes asignados." : "No se encontraron usuarios."}
                        </p>
                    )}
                </div>
            </div>
            {isCreateModalOpen && (
                <CreatePatientModal 
                    manageableRole={manageableRole}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handlePatientCreated}
                />
            )}
            
            {userToDelete && (
                <UserDeleteConfirmationModal
                    user={userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                />
            )}
        </>
    );
};

export default UserManagement;
