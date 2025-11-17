import React from 'react';
import { ContentItem, ContentType } from '../../../types';
import { CloseIcon } from '../../shared/Icons';

interface ContentPlayerModalProps {
    item: ContentItem;
    onClose: () => void;
    onMarkComplete: (item: ContentItem) => void;
}

const getEmbedUrl = (item: ContentItem): string | null => {
    // Defensive check: Ensure content is a string and looks like a valid URL.
    if (!item.content || typeof item.content !== 'string' || !item.content.startsWith('http')) {
        console.warn(`Invalid or non-URL content for item "${item.title}": ${item.content}`);
        return null;
    }

    try {
        const url = new URL(item.content);
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
            const videoId = url.hostname.includes('youtu.be')
                ? url.pathname.slice(1).split('?')[0] // handle youtu.be/ID?si=...
                : url.searchParams.get('v');
            if (videoId) {
                 return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            }
        }
        if (url.hostname.includes('spotify.com')) {
            // e.g. https://open.spotify.com/episode/1234
            const pathParts = url.pathname.split('/');
            if (pathParts[1] === 'episode' && pathParts[2]) {
                return `https://open.spotify.com/embed/episode/${pathParts[2]}?utm_source=generator`;
            }
        }
    } catch (error) {
        console.error("Error parsing URL for content item:", item.content, error);
        return null;
    }
    return null;
};


const ContentPlayerModal: React.FC<ContentPlayerModalProps> = ({ item, onClose, onMarkComplete }) => {
    const embedUrl = item.type !== ContentType.Text ? getEmbedUrl(item) : null;
    const isSpotify = item.type === ContentType.Audio;
    const isText = item.type === ContentType.Text;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" style={{ animationDuration: '0.3s' }}>
                <header className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-dark truncate pr-4">{item.title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 flex-shrink-0">
                        <CloseIcon className="w-6 h-6 text-slate-600" />
                    </button>
                </header>
                <main className="flex-1 p-2 sm:p-4 overflow-y-auto bg-slate-50">
                    {isText ? (
                        <div className="prose max-w-none p-4 whitespace-pre-wrap">
                            <p>{item.content}</p>
                        </div>
                    ) : embedUrl ? (
                         <div className={`relative ${isSpotify ? 'h-[152px]' : 'w-full pb-[56.25%]'}`}>
                             <iframe
                                 src={embedUrl}
                                 className="absolute top-0 left-0 w-full h-full"
                                 title={item.title}
                                 frameBorder="0"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                 allowFullScreen
                             ></iframe>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-brand-text p-8 text-center">
                            <h3 className="text-2xl font-bold mb-2">Contenido no disponible</h3>
                            <p className="text-slate-600">El enlace proporcionado no es compatible o está roto. Por favor, contacta a tu terapeuta para que lo revise.</p>
                            <p className="mt-4 text-sm text-slate-500 font-mono">{item.content}</p>
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t bg-slate-100 rounded-b-2xl flex justify-end">
                    <button
                        onClick={() => onMarkComplete(item)}
                        className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
                    >
                        Marcar como Completado
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ContentPlayerModal;