import { useContext } from 'react';
import { AuthContext } from '../App'; // Ajusta esta ruta si es necesario
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  originalUser: User | null;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ user: any, session: any }>;
  simulateRole: (role: string) => void;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Función específica para actualizar el perfil del usuario en el estado local
export const useAuthActions = () => {
  const { user, setUser } = useAuth();
  
  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      // Aquí necesitamos actualizar el estado, pero como no tenemos setUser directamente,
      // necesitamos una forma de actualizarlo
      return updatedUser;
    }
    return null;
  };

  return { updateUserProfile };
};