// src/lib/supabaseService.ts
import { supabase } from './supabaseClient';

const TIMEOUT = 15000;
const withTimeout = <T>(promise: Promise<T>, ms = TIMEOUT) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('⏳ Timeout — Supabase tardó demasiado.')), ms);
    promise.then(resolve).catch(reject).finally(() => clearTimeout(timer));
  });

/* -------------------- AUTENTICACIÓN -------------------- */

// Crear user con rollback si falla la creación del perfil
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
      await supabase.auth.admin.deleteUser(authUser.user.id); // 🔥 ROLLBACK real
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

// Update parcial más limpio
export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  return supabase.from('profiles').update(updates).eq('id', userId);
}

// Elimina perfil + Auth real (no deja usuarios zombis)
export async function deleteUser(userId: string) {
  await supabase.from('profiles').delete().eq('id', userId);
  return await supabase.auth.admin.deleteUser(userId);
}

/* -------------------- CONTENIDOS -------------------- */

export async function createContent(data: any) {
  return supabase.from('contents').insert(data);
}

export async function getContents() {
  return supabase.from('contents').select('*').order('created_at', { ascending: false });
}

export async function deleteContent(id: string) {
  return supabase.from('contents').delete().eq('id', id);
}

/* -------------------- SUBIDA DE ARCHIVOS -------------------- */

export async function uploadFile(bucket: string, fileName: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);

  if (error) throw new Error('Fallo subiendo archivo.');
  return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
}

/* -------------------- LOG FORMAL PARA DEBUG -------------------- */

export function log(...msg: any[]) {
  console.log('📌 [SUPABASE]', ...msg);
}
