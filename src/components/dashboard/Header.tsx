





import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../../App';
import { AppLogo } from '../../shared/AppLogo';
import { Role } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { UploadIcon } from '../../shared/Icons';

const RoleSwitcher: React.FC = () => {
    const auth = useContext(AuthContext);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as Role;
        if (auth && auth.user && newRole !== auth.user.role) {
            setIsUpdating(true);
            auth.simulateRole(newRole);
            // Simulate a short delay for better UX
            setTimeout(() => setIsUpdating(false), 200);
        }
    };

    // Only show the role switcher if the original user is an Admin.
    if (!auth?.originalUser || auth.originalUser.role !== Role.Admin) {
        return null;
    }

    return (
        <div className="flex items-center ml-4">
            <label htmlFor="role-switcher" className="text-sm font-medium text-slate-600 mr-2 whitespace-nowrap">Simular Rol:</label>
            <select
                id="role-switcher"
                value={auth?.user?.role} // The value reflects the current effective/simulated role
                onChange={handleRoleChange}
                disabled={isUpdating}
                className="block w-full pl-3 pr-10 py-1.5 text-base border-slate-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
            >
                <option value={Role.Admin}>Admin</option>
                <option value={Role.Therapist}>Terapeuta</option>
                <option value={Role.Patient}>Paciente</option>
            </select>
        </div>
    );
};


const Header: React.FC = () => {
  const auth = useContext(AuthContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !auth?.setLogoUrl) return;

      setIsUploading(true);
      setUploadError(null);
      try {
          // Use a consistent file name to overwrite the previous logo
          const filePath = `public/logo.${file.name.split('.').pop()}`;
          const newUrl = await supabaseService.uploadAppAsset(filePath, file);
          await supabaseService.updateSetting('logo_url', newUrl);
          auth.setLogoUrl(newUrl);
      } catch (error: any) {
          console.error("Error uploading logo:", error);
          const message = error.message.toLowerCase();
          if (message.includes('bucket not found')) {
              setUploadError("Error: El 'bucket' de almacenamiento 'app-assets' no existe. Por favor, créalo como público en tu panel de Supabase.");
          } else if (message.includes('violates row-level security policy')) {
              setUploadError("Error de permisos. Asegúrate de que las políticas de seguridad (RLS) para el almacenamiento se hayan aplicado en Supabase.");
          }
          else {
              setUploadError(error.message || "No se pudo subir el logo.");
          }
          // Clear error after some time
          setTimeout(() => setUploadError(null), 8000);
      } finally {
          setIsUploading(false);
      }
  };

  if (!auth?.user) return null;

  const getRoleName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
  
  const isAdmin = auth.originalUser?.role === Role.Admin;

  return (
    <header className="bg-brand-light border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="relative group">
              <AppLogo imageUrl={auth.logoUrl} className="h-16 w-auto object-contain" />
              {isAdmin && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                    aria-label="Cambiar logo"
                  >
                    {isUploading ? (
                      <span className="text-xs">Subiendo...</span>
                    ) : (
                      <>
                        <UploadIcon className="w-6 h-6" />
                        <span className="text-xs font-semibold">Cambiar logo</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
             {uploadError && <p className="text-red-500 text-xs ml-4">{uploadError}</p>}
            <RoleSwitcher />
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4">
              <p className="font-semibold text-brand-dark">{auth.user.name}</p>
              <p className="text-sm text-slate-500">{getRoleName(auth.user.role)}</p>
            </div>
            <button
              onClick={auth.logout}
              className="px-4 py-2 bg-brand-accent text-white rounded-lg font-semibold hover:bg-opacity-80 transition-colors duration-300"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;