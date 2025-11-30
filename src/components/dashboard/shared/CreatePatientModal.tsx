import React, { useState, useRef, ChangeEvent, useContext } from 'react';
import * as supabaseService from '../../../services/supabaseService';
import { AuthContext } from '../../../App';
import { CloseIcon, PhotoIcon } from '../../../shared/Icons';
import { User, UserRole } from '../../../types';

interface CreatePatientModalProps {
    onClose: () => void;
    onSuccess: () => void;
    manageableRole: UserRole.Admin | UserRole.Patient;
}

const spiritualPaths = [
    "-- Selecciona una senda --",
    "Budismo",
    "Cristianismo",
    "Hinduismo",
    "Islam",
    "Judaísmo",
    "Nueva Era",
    "Espiritualidad sin religión",
    "Ateísmo/Agnosticismo",
    "Otra"
];

const FormInput: React.FC<{ 
    name: string, 
    label: string, 
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    type?: string, 
    required?: boolean 
}> = ({ name, label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
    </div>
);

const FormTextarea: React.FC<{ 
    name: string, 
    label: string, 
    value: string,
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void,
    rows?: number 
}> = ({ name, label, value, onChange, rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <textarea
            id={name}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
    </div>
);

const CreatePatientModal: React.FC<CreatePatientModalProps> = ({ onClose, onSuccess, manageableRole }) => {
    const [formData, setFormData] = useState<Partial<User & { password?: string; photoFile?: File }>>({
        role: manageableRole === UserRole.Patient ? UserRole.Patient : UserRole.Patient,
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const auth = useContext(AuthContext);

    const isTherapistView = manageableRole === UserRole.Patient;

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, photoFile: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!formData.name || !formData.email || !formData.password) {
            setError("Nombre, email y contraseña son campos obligatorios.");
            setLoading(false);
            return;
        }

        try {
            const result = await supabaseService.createUser(
                formData.email,
                formData.password,
                formData.name
            );

            if (result.error) {
                throw new Error(result.error);
            }

            if (formData.photoFile && result.user) {
                try {
                    const photoUrl = await supabaseService.uploadFile(
                        'user-assets',
                        `${result.user.id}/profile.jpg`,
                        formData.photoFile
                    );
                    await supabaseService.updateUserProfile(result.user.id, { photo_url: photoUrl });
                } catch (photoErr) {
                    console.warn('Foto no se pudo subir:', photoErr);
                }
            }

            if (result.user) {
                const updates: any = {
                    role: isTherapistView ? UserRole.Patient : formData.role,
                    bio: formData.bio,
                    spiritual_path: formData.spiritual_path,
                };

                if (isTherapistView && auth?.user?.id) {
                    updates.therapist_id = auth.user.id;
                }

                await supabaseService.updateUserProfile(result.user.id, updates);
            }

            onSuccess();
        } catch (err: any) {
            console.error("Error al crear usuario:", err);
            let errorMessage = "Ocurrió un error inesperado al crear el usuario.";

            if (err && typeof err === 'object' && 'message' in err) {
                const message = err.message.toLowerCase();
                
                if (message.includes('user already registered') || message.includes('already exists')) {
                    errorMessage = "Este correo electrónico ya está registrado.";
                } else if (message.includes('password')) {
                    errorMessage = "La contraseña debe tener al menos 6 caracteres.";
                } else if (message.includes('email')) {
                    errorMessage = "El formato del correo electrónico no es válido.";
                } else if (message.includes('bucket not found')) {
                    errorMessage = "Error: El bucket 'user-assets' no existe. Créalo en Supabase.";
                } else {
                    errorMessage = err.message;
                }
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" style={{ animationDuration: '0.3s' }}>
                <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-brand-dark">
                        {isTherapistView ? 'Registrar Nuevo Paciente' : 'Crear Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <main className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 flex flex-col items-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer w-40 h-40 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-brand-primary"
                                >
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Vista previa" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="text-center text-slate-500">
                                            <PhotoIcon className="w-12 h-12 mx-auto" />
                                            <span className="text-sm">Subir foto</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <FormInput name="name" label="Nombre Completo" required value={formData.name || ''} onChange={handleChange} />
                                <FormInput name="email" label="Correo Electrónico" type="email" required value={formData.email || ''} onChange={handleChange} />
                                <FormInput name="password" label="Contraseña Temporal" type="password" required value={formData.password || ''} onChange={handleChange} />
                                {!isTherapistView && (
                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                                            Rol del Usuario<span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            onChange={handleChange}
                                            value={formData.role || UserRole.Patient}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
                                        >
                                            <option value={UserRole.Patient}>Paciente</option>
                                            <option value={UserRole.Therapist}>Terapeuta</option>
                                            <option value={UserRole.Admin}>Admin</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-brand-dark border-b pb-2">Información Adicional</h3>
                            <div>
                                <label htmlFor="spiritual_path" className="block text-sm font-medium text-slate-700">Senda Espiritual</label>
                                <select
                                    id="spiritual_path"
                                    name="spiritual_path"
                                    onChange={handleChange}
                                    value={formData.spiritual_path || ''}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
                                >
                                    {spiritualPaths.map(path => (
                                        <option key={path} value={path === spiritualPaths[0] ? '' : path}>
                                            {path}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <FormTextarea name="bio" label="Biografía" value={formData.bio || ''} onChange={handleChange} />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
                    </main>
                    <footer className="p-4 border-t bg-slate-50 rounded-b-2xl flex justify-end sticky bottom-0 z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-3 px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:bg-slate-400"
                        >
                            {loading ? 'Guardando...' : (isTherapistView ? 'Guardar Paciente' : 'Guardar Usuario')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default CreatePatientModal;