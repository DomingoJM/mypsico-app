import React from 'react';
import { ChatIcon } from '../shared/Icons';

interface SurveyLink {
    name: string;
    description: string;
    url: string;
}

const surveyLinks: SurveyLink[] = [
    {
        name: 'Test de Depresión (PHQ-9)',
        description: 'Cuestionario de 9 preguntas para evaluar la severidad de la depresión.',
        url: 'https://www.mdcalc.com/calc/1725/phq-9-patient-health-questionnaire-9',
    },
    {
        name: 'Test de Ansiedad (GAD-7)',
        description: 'Cuestionario de 7 preguntas para medir la ansiedad generalizada.',
        url: 'https://www.mdcalc.com/calc/1727/gad-7-general-anxiety-disorder-7',
    },
    {
        name: 'Escala de Estrés Percibido (PSS)',
        description: 'Mide el grado en que las situaciones de la vida se perciben como estresantes.',
        url: 'https://www.das.uchile.cl/test-de-estres-percibido-pss-10/',
    },
    {
        name: 'Test de Eneagrama',
        description: 'Descubre tu tipo de personalidad según el Eneagrama para un mayor autoconocimiento.',
        url: 'https://www.truity.com/test/enneagram-personality-test',
    },
    {
        name: 'Test del Niño Interior',
        description: 'Conecta con tu niño interior para identificar y sanar heridas del pasado.',
        url: 'https://www.psicoactiva.com/test/test-del-nino-interior/',
    },
];

interface ExternalSurveyScreenProps {
    onBack: () => void;
    onChatOpen: () => void;
}

const ExternalSurveyScreen: React.FC<ExternalSurveyScreenProps> = ({ onBack, onChatOpen }) => {
    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2940&auto=format&fit=crop')" }}
        >
             <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl text-center animate-fade-in-up">
                <h1 className="text-4xl font-bold font-serif text-brand-dark mb-4">Centro de Evaluaciones</h1>
                <p className="text-brand-text mb-8 text-lg">
                    Selecciona una de las siguientes evaluaciones estandarizadas. Al finalizar, toma una
                    <b className="text-brand-dark"> captura de pantalla</b> de tus resultados y compártela con nuestro asistente de IA para recibir tu plan personalizado.
                </p>

                <div className="space-y-4 mb-8">
                    {surveyLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full p-4 bg-white/70 border border-slate-200 rounded-lg text-left hover:border-brand-primary hover:shadow-md transition-all"
                        >
                            <h3 className="font-bold text-brand-primary text-lg">{link.name}</h3>
                            <p className="text-brand-text text-sm">{link.description}</p>
                        </a>
                    ))}
                </div>

                <div className="bg-brand-primary/10 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                     <ChatIcon className="w-10 h-10 text-brand-primary flex-shrink-0" />
                    <div>
                         <h3 className="font-bold text-brand-dark text-lg text-left">¿Ya tienes tus resultados?</h3>
                         <p className="text-brand-text text-left">
                            Abre el chat, adjunta tu captura de pantalla y pide tu plan personalizado.
                         </p>
                    </div>
                     <button
                        onClick={onChatOpen}
                        className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                    >
                        Abrir Asistente
                    </button>
                </div>
                
                 <button
                    onClick={onBack}
                    className="mt-10 text-brand-text font-semibold hover:text-brand-dark transition-colors"
                >
                    &larr; Volver al panel
                </button>
            </div>
        </div>
    );
};

export default ExternalSurveyScreen;