import { supabase } from '../supabase';
import { PromoResource, PromoResourceFormData, ActivityLog } from '../types';

export { supabase };

const TIMEOUT = 15000;
const withTimeout = <T>(promise: Promise<T>, ms = TIMEOUT) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('⏳ Timeout — Supabase tardó demasiado.')), ms);
    promise.then(resolve).catch(reject).finally(() => clearTimeout(timer));
  });

/* -------------------- AUTENTICACIÓN -------------------- */

export async function createUser(email: string, password: string, name: string) {
  try {
    const { data: authUser, error: authError } = await withTimeout(
      supabase.auth.signUp({ email, password })
    );

    if (authError) throw new Error('❌ No se pudo crear autenticación: ' + authError.message);
    if (!authUser.user) throw new Error('❌ Fallo inesperado creando usuario.');

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authUser.user.id,
      name,
      email,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error('⚠ Perfil no se creó — usuario revertido.');
    }

    return authUser;
  } catch (err) {
    return { error: err instanceof Error ? err.message : err };
  }
}

export async function login(email: string, password: string) {
  return withTimeout(supabase.auth.signInWithPassword({ email, password }));
}

export async function logout() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  return (await supabase.auth.getUser()).data.user;
}

/* -------------------- PERFILES -------------------- */

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error('Perfil no encontrado.');
  return data;
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  return supabase.from('profiles').update(updates).eq('id', userId);
}

export async function deleteUser(userId: string) {
  await supabase.from('profiles').delete().eq('id', userId);
  return await supabase.auth.admin.deleteUser(userId);
}

/* -------------------- CONTENIDOS -------------------- */

export const getContents = async () => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const addContent = async (contentData: any) => {
  const { data, error } = await supabase
    .from('content')
    .insert([contentData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateContent = async (id: number, updates: any) => {
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteContent = async (id: number) => {
  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getContentById = async (id: number) => {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

/* -------------------- RECURSOS PROMOCIONALES -------------------- */

export async function getPromotionalItems(): Promise<PromoResource[]> {
  const { data, error } = await supabase
    .from('promo_resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addPromotionalItem(
  itemData: Omit<PromoResource, 'id' | 'created_at' | 'download_count'>,
  createdBy: string
): Promise<PromoResource> {
  const { data, error } = await supabase
    .from('promo_resources')
    .insert([{ ...itemData, created_by: createdBy, download_count: 0 }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePromotionalItem(
  id: string,
  updates: Partial<PromoResourceFormData>
): Promise<void> {
  if (updates.is_public === true) {
    await supabase
      .from('promo_resources')
      .update({ is_public: false })
      .neq('id', id);
  }

  const { error } = await supabase
    .from('promo_resources')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deletePromotionalItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('promo_resources')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getActivePromotionalItem(): Promise<PromoResource | null> {
  const { data, error } = await supabase
    .from('promo_resources')
    .select('*')
    .eq('is_public', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/* -------------------- ACTIVITY LOGS -------------------- */

export async function getActivityLogsForPatient(patientId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      content:content_id (
        id,
        title,
        type,
        url
      )
    `)
    .eq('user_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/* -------------------- SUBIDA DE ARCHIVOS -------------------- */

export async function uploadFile(bucket: string, fileName: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);

  if (error) throw new Error('Fallo subiendo archivo.');
  return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
}

export async function uploadAppAsset(filePath: string, file: File): Promise<string> {
  const { data, error } = await supabase.storage
    .from('app-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw new Error(`Error subiendo archivo: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('app-assets')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/* -------------------- LOG -------------------- */

export function log(...msg: any[]) {
  console.log('📌 [SUPABASE]', ...msg);
}