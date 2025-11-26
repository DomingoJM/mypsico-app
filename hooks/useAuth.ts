import { useContext } from 'react';
import { AuthContext } from '../src/App';
import { User, Role } from '../types';

// Interface corregida para que coincida con App.tsx
interface AuthContextType {
  user: User | null;
  originalUser: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ user: any, session: any }>;
  simulateRole: (role: Role) => void;
}

export const useAuth = (): AuthContextType => {
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
    if (user && setUser) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return updatedUser;
    }
    return null;
  };

  return { updateUserProfile };
};