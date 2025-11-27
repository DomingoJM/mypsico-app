import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PromotionalItem } from '../../../../types';
import * as supabaseService from '../../../services/supabaseService';
import { BookIcon, VideoIcon } from '../../../shared/Icons';

const ResourceCard: React.FC<{ item: PromotionalItem }> = ({ item }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group">
        <div className="relative">
            <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-semibold">
                {item.item_type === 'libro' ? <BookIcon className="w-4 h-4"/> : <VideoIcon className="w-4 h-4"/>}
                <span className="capitalize">{item.item_type}</span>
            </div>
        </div>
        <div className="p-4 flex-grow flex flex-col">
            {item.thematic && (
                <span className="text-xs font-semibold text-brand-primary mb-2 uppercase tracking-wider">
                    {item.thematic.replace(/_/g, ' ')}
                </span>
             )}
            <h3 className="text-xl font-bold font-serif text-brand-dark flex-grow">{item.title}</h3>
            <p className="mt-2 text-brand-text text-sm line-clamp-3">{item.description}</p>
        </div>
        <div className="p-4 bg-slate-50 border-t">
            <a
                href={item.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
                Ver más
            </a>
        </div>
    </div>
);


const ResourcesView: React.FC = () => {
    const [items, setItems] = useState<PromotionalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<'all' | 'libro' | 'curso'>('all');
    const [thematicFilter, setThematicFilter] = useState<string>('all');

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await supabaseService.getPromotionalItems();
            setItems(data);
        } catch (err: unknown) {
            console.error("Failed to load promotional items:", err);
            let errorMessage = "No se pudieron cargar los recursos.";
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (err && typeof err === 'object' && 'message' in err) {
                errorMessage = String((err as { message: string }).message);
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const availableThematics = useMemo(() => {
        const themes = new Set<string>();
        items.forEach(item => {
            if (item.thematic) {
                themes.add(item.thematic);
            }
        });
        return Array.from(themes).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const typeMatch = typeFilter === 'all' || item.item_type === typeFilter;
            const thematicMatch = thematicFilter === 'all' || item.thematic === thematicFilter;
            return typeMatch && thematicMatch;
        });
    }, [items, typeFilter, thematicFilter]);


    if (loading) return <div>Cargando recursos...</div>;
    
    if (error) return (
        <div className="text-center p-8 bg-red-50 text-red-800 rounded-lg shadow-md border border-red-200">
            <h3 className="font-bold text-lg mb-2">Error al Cargar los Recursos</h3>
            <p>{error}</p>
            <button onClick={fetchItems} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors">
                Intentar de Nuevo
            </button>
        </div>
    );

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold font-serif text-brand-dark mb-6">Recursos Adicionales</h2>
            
            <div className="mb-8 p-4 bg-white rounded-lg border flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full sm:w-auto">
                    <label htmlFor="type-filter" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por tipo:</label>
                    <select
                        id="type-filter"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="libro">Libros</option>
                        <option value="curso">Cursos</option>
                    </select>
                </div>

                {availableThematics.length > 0 && (
                    <div className="flex-1 w-full sm:w-auto">
                        <label htmlFor="thematic-filter" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por temática:</label>
                        <select
                            id="thematic-filter"
                            value={thematicFilter}
                            onChange={(e) => setThematicFilter(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                        >
                            <option value="all">Todas las temáticas</option>
                            {availableThematics.map(theme => (
                                <option key={theme} value={theme} className="capitalize">{theme.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {items.length > 0 ? (
                filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredItems.map(item => (
                            <ResourceCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-lg">
                        <p className="text-lg text-slate-600">No se encontraron recursos que coincidan con tus filtros.</p>
                        <p className="text-slate-500 text-md mt-2">Intenta con una selección diferente o limpia los filtros.</p>
                    </div>
                )
            ) : (
                <div className="text-center py-16 bg-slate-50 rounded-lg">
                    <p className="text-lg text-slate-600">No hay libros o cursos disponibles en este momento.</p>
                    <p className="text-slate-500 text-md mt-2">Vuelve a consultar más tarde para ver nuevos recursos.</p>
                </div>
            )}
        </div>
    );
};

export default ResourcesView;