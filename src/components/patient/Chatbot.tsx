import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../../services/geminiService';
import { ChatMessage } from '../../../types';
import { CloseIcon, SendIcon, MicrophoneIcon, SpeakerOnIcon, SpeakerOffIcon } from '../../shared/Icons';
import { AppLogo } from '../../shared/AppLogo';
import { Chat } from '@google/genai';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript error,
// as it's not part of the standard TS DOM library.
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

interface ChatbotProps {
    onClose: () => void;
}

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const AttachmentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
    </svg>
);


const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(() => localStorage.getItem('speechEnabled') === 'true');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Initialize Speech Recognition and Synthesis
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-ES';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false); 
            };
            
            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
        
        // Warm up speech synthesis API to get voices list
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();

        // Cleanup
        return () => {
            recognitionRef.current?.stop();
            window.speechSynthesis.cancel();
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);
    
    // Persist speech setting
    useEffect(() => {
        localStorage.setItem('speechEnabled', String(isSpeechEnabled));
    }, [isSpeechEnabled]);

    useEffect(() => {
        setChat(geminiService.startChat());
        setMessages([{
            role: 'model',
            parts: [{ text: '¡Hola! Soy tu asistente de MYPSICO. ¿En qué puedo ayudarte? Puedes adjuntar una imagen de tus resultados de evaluación para recibir un plan personalizado.' }],
        }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
     const speak = (text: string) => {
        if (!isSpeechEnabled || !text.trim()) return;
        
        window.speechSynthesis.cancel(); // Stop any currently speaking utterance
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        
        // Prioritize female Spanish voices for a therapeutic tone
        let selectedVoice = 
            voices.find(v => v.lang.startsWith('es-US') && v.name.includes('Female')) ||
            voices.find(v => v.lang.startsWith('es-ES') && v.name.includes('Female')) ||
            voices.find(v => v.lang.startsWith('es-MX') && v.name.includes('Female')) ||
            voices.find(v => v.lang.startsWith('es-') && v.name.includes('Female')) ||
            voices.find(v => v.lang.startsWith('es-'));

        utterance.voice = selectedVoice || voices.find(v => v.lang === 'es-ES') || null;
        utterance.lang = 'es-ES';
        utterance.rate = 0.95; // Slightly slower for a calm pace
        utterance.pitch = 1.0; // Neutral pitch

        window.speechSynthesis.speak(utterance);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const preview = URL.createObjectURL(file);
            setImage({ file, preview });
        }
    };
    
    const handleToggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setInput(''); // Clear input before listening
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((input.trim() === '' && !image) || isLoading || !chat) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        window.speechSynthesis.cancel();

        const textToSend = input;
        const imageToSend = image;

        // Reset UI state first
        setInput('');
        setImage(null);
        setIsLoading(true);

        // Prepare message parts for both display and the API
        const displayParts: ChatMessage['parts'] = [];
        const apiParts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];

        if (textToSend.trim()) {
            displayParts.push({ text: textToSend });
            apiParts.push({ text: textToSend });
        }

        if (imageToSend) {
            // Convert file to base64 once for both display and API
            const base64Data = await fileToBase64(imageToSend.file);
            // FIX: Display the image the user sent in the chat history
            displayParts.push({ inlineData: { mimeType: imageToSend.file.type, data: base64Data } });
            apiParts.push({ inlineData: { mimeType: imageToSend.file.type, data: base64Data } });
        }
        
        // Add the complete user message to the chat history
        setMessages(prev => [...prev, { role: 'user', parts: displayParts }]);
        
        let modelResponse = '';

        // Add a placeholder for the model's response to stream into
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

        try {
            // FIX: The sendMessageStream method takes an array of Parts.
            // Convert all parts to Part objects for consistency.
            const stream = await chat.sendMessageStream(apiParts);
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                // Update the last message (the placeholder) with the streaming response
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.parts = [{ text: modelResponse }];
                    }
                    return newMessages;
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
            modelResponse = 'Lo siento, algo salió mal. Por favor, intenta de nuevo.';
            // FIX: Update the placeholder with the error message instead of adding a new one.
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts = [{ text: modelResponse }];
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
            if (modelResponse.trim()) {
                speak(modelResponse);
            }
        }
    };

    const renderMessagePart = (part: ChatMessage['parts'][0], index: number) => {
        if (part.text) {
            return <p key={index} style={{ whiteSpace: 'pre-wrap' }}>{part.text}</p>;
        }
        if (part.inlineData) {
            // Check if data is a blob URL or base64
            const src = part.inlineData.data.startsWith('blob:') 
                ? part.inlineData.data 
                : `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            return <img key={index} src={src} alt="Adjunto" className="max-w-full h-auto rounded-lg mt-2" />;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col font-sans">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <AppLogo className="w-10 h-10"/>
                        <h2 className="text-xl font-bold font-serif text-brand-dark">Asistente Virtual</h2>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setIsSpeechEnabled(!isSpeechEnabled)} className="p-2 rounded-full hover:bg-slate-100" title={isSpeechEnabled ? "Desactivar voz" : "Activar voz"}>
                            {isSpeechEnabled ? <SpeakerOnIcon className="w-6 h-6 text-brand-primary" /> : <SpeakerOffIcon className="w-6 h-6 text-slate-500" />}
                        </button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                            <CloseIcon className="w-6 h-6 text-slate-600"/>
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-slate-100 text-brand-text rounded-bl-none'}`}>
                                {msg.parts.map(renderMessagePart)}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[80%] p-3 rounded-2xl bg-slate-100 text-brand-text rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>
                <footer className="p-4 border-t bg-white">
                    {image && (
                        <div className="mb-2 p-2 bg-slate-100 rounded-lg relative w-fit">
                            <img src={image.preview} alt="Vista previa" className="h-20 w-auto rounded" />
                             <button
                                onClick={() => setImage(null)}
                                className="absolute -top-2 -right-2 bg-black/60 text-white rounded-full p-1"
                                aria-label="Eliminar imagen"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-500 hover:text-brand-primary rounded-full hover:bg-slate-100 transition-colors"
                            aria-label="Adjuntar imagen"
                        >
                            <AttachmentIcon className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={isListening ? "Escuchando..." : "Escribe tu mensaje..."}
                            className="flex-1 px-4 py-2 bg-slate-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={handleToggleListening}
                            className={`p-3 rounded-full hover:bg-slate-100 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}
                            aria-label={isListening ? "Dejar de escuchar" : "Usar micrófono"}
                        >
                           <MicrophoneIcon className="w-5 h-5" />
                        </button>
                        <button type="submit" className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-dark disabled:bg-slate-400" disabled={isLoading || (input.trim() === '' && !image)}>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default Chatbot;