// ✅ AHORA (línea 2):
import { supabase } from '../supabase';
import { 
  Content, 
  ContentFormData, 
  ContentStatus, 
  ContentType,
  ContentWithCreator
} from '../types';

// Obtener todo el contenido activo
export const getActiveContent = async (): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('status', ContentStatus.Active)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active content:', error);
    throw error;
  }
};

// Obtener contenido por tipo
export const getContentByType = async (type: ContentType): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', type)
      .eq('status', ContentStatus.Active)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching content by type:', error);
    throw error;
  }
};

// Obtener contenido destacado
export const getFeaturedContent = async (): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('featured', true)
      .eq('status', ContentStatus.Active)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured content:', error);
    throw error;
  }
};

// Obtener contenido por categoría
export const getContentByCategory = async (category: string): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('category', category)
      .eq('status', ContentStatus.Active)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching content by category:', error);
    throw error;
  }
};

// Obtener contenido con filtros
export const getContent = async (filters?: {
  type?: ContentType;
  category?: string;
  status?: ContentStatus;
  featured?: boolean;
}): Promise<Content[]> => {
  try {
    let query = supabase
      .from('content')
      .select('*');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', ContentStatus.Active);
    }
    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

// Obtener un contenido por ID
export const getContentById = async (id: number): Promise<Content | null> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    throw error;
  }
};

// Crear nuevo contenido
export const createContent = async (contentData: ContentFormData): Promise<Content> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .insert([{
        ...contentData,
        status: contentData.status || ContentStatus.Draft,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

// Actualizar contenido
export const updateContent = async (id: number, updates: Partial<ContentFormData>): Promise<Content> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

// Actualizar estado del contenido
export const updateContentStatus = async (id: number, status: ContentStatus): Promise<void> => {
  try {
    const { error } = await supabase
      .from('content')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating content status:', error);
    throw error;
  }
};

// Eliminar contenido
export const deleteContent = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Buscar contenido
export const searchContent = async (searchTerm: string): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('status', ContentStatus.Active)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
};

// Incrementar contador de vistas
export const incrementViewCount = async (id: number): Promise<void> => {
  try {
    const { data: content } = await supabase
      .from('content')
      .select('view_count')
      .eq('id', id)
      .single();

    if (content) {
      const { error } = await supabase
        .from('content')
        .update({ view_count: (content.view_count || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    throw error;
  }
};