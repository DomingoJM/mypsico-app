import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabaseService } from '../../services/supabaseService';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Actualizar el perfil del usuario para marcar que aceptó
      await supabaseService.updateUserProfile(user.id, { 
        has_completed_survey: true 
      });

      // Actualizar el estado local
      updateUserProfile({ hasCompletedSurvey: true });
      
      onClose();
    } catch (error) {
      console.error('Error al aceptar consentimiento:', error);
      alert('Hubo un error. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">
            Consentimiento Informado
          </h2>
          
          <div className="space-y-4 text-sm text-gray-700 mb-6">
            <p>
              <strong>1. Finalidad del tratamiento:</strong> Los datos personales que usted proporcione serán utilizados exclusivamente para fines terapéuticos, con el objetivo de mejorar su bienestar psicológico y emocional.
            </p>
            
            <p>
              <strong>2. Consentimiento:</strong> Al aceptar este consentimiento, usted autoriza expresamente al psicólogo a utilizar sus datos personales para los fines mencionados anteriormente.
            </p>
            
            <p>
              <strong>3. Derechos del titular:</strong> Usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, puede contactar al responsable del tratamiento.
            </p>
            
            <p>
              <strong>4. Confidencialidad:</strong> El psicólogo se compromete a mantener la confidencialidad de toda la información proporcionada durante el proceso terapéutico.
            </p>
            
            <p>
              <strong>5. Duración del tratamiento:</strong> Los datos personales serán conservados mientras dure la relación terapéutica y posteriormente según lo establecido por la normativa aplicable.
            </p>
            
            <p>
              <strong>6. Transferencia de datos:</strong> No se realizarán transferencias internacionales de datos sin su consentimiento expreso.
            </p>
            
            <p>
              <strong>7. Modificaciones:</strong> Cualquier modificación a este consentimiento informado será comunicada oportunamente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Aceptar y Continuar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;