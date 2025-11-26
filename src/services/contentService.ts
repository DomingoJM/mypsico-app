import { supabase } from '../supabase';
import { ContentItem } from '../../types';
import { withTimeout } from './supabaseService';

// Tipos para el contenido diario
export interface DailyContent {
  audio?: ContentItem;
  terapia?: ContentItem;
  meditacion?: ContentItem;
  video_sanacion?: ContentItem;
  [key: string]: ContentItem | undefined;
}

export const contentService = {
  // Obtener el contenido más reciente por tipo
  getDailyContent: async (): Promise<DailyContent> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    try {
      // Obtener todos los tipos de contenido disponibles
      const contentTypes = ['audio', 'texto', 'video', 'formulario', 'video_sanacion'];
      const dailyContent: DailyContent = {};

      // Para cada tipo, obtener el contenido más reciente
      for (const type of contentTypes) {
        const { data, error } = await withTimeout(
          supabase
            .from('content')
            .select('*')
            .eq('type', type)
            .order('created_at', { ascending: false })
            .limit(1),
          10000
        );

        if (error) {
          console.warn(`Error fetching ${type} content:`, error);
          continue;
        }

        if (data && data.length > 0) {
          // Mapear los tipos a nombres más amigables
          let key = type;
          if (type === 'texto') key = 'terapia';
          if (type === 'video') key = 'meditacion';
          
          dailyContent[key] = data[0] as ContentItem;
        }
      }

      return dailyContent;
    } catch (error) {
      console.error('Error fetching daily content:', error);
      return {};
    }
  },

  // Obtener contenido por tipo específico
  getContentByType: async (type: string): Promise<ContentItem[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    const { data, error } = await withTimeout(
      supabase
        .from('content')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false }),
      10000
    );

    if (error) throw error;
    return data as ContentItem[];
  },

  // Obtener el contenido más reciente de cualquier tipo
  getLatestContent: async (): Promise<ContentItem[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    const { data, error } = await withTimeout(
      supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6), // Limitar a 6 para no sobrecargar
      10000
    );

    if (error) throw error;
    return data as ContentItem[];
  }
};