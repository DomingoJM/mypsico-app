import { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from './useAuth';

export const useConsent = () => {
  const { user } = useAuth();
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

  const closeConsent = () => {
    setShowConsent(false);
  };

  return {
    showConsent,
    closeConsent
  };
};