import { useState, useEffect } from 'react';
import { User } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from './useAuth';

export const useConsent = () => {
  const { user, setUser } = useAuth(); // Ajustar para usar setUser
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Mostrar consentimiento solo si:
    // - El usuario está logueado
    // - Es paciente
    // - No ha completado la encuesta aún
    if (user && user.role === 'paciente' && !user.hasCompletedSurvey) {
      setShowConsent(true);
    }
  }, [user]);

  const closeConsent = async () => {
    if (user) {
      // Actualizar en la base de datos
      await supabaseService.updateUserProfile(user.id, { 
        has_completed_survey: true 
      });
      
      // Actualizar el estado local
      if (setUser) {
        setUser({ ...user, hasCompletedSurvey: true });
      }
    }
    setShowConsent(false);
  };

  return {
    showConsent,
    closeConsent
  };
};