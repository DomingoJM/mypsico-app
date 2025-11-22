/*
-- =====================================================================
-- == GUÍA DE SOLUCIÓN DE PROBLEMAS DE PERMISOS DE SUPABASE ==
-- =====================================================================
--
-- Si encuentras errores como "new row violates row-level security policy"
-- o botones de administrador/terapeuta que aparecen inactivos (ej. "Eliminar"),
-- la causa casi siempre está en la configuración de la base de datos.
--
-- CAUSA #1: ROL DE USUARIO INCORRECTO (La más común)
-- ---------------------------------------------------
-- La aplicación decide qué puedes hacer basándose en tu rol ('admin',
-- 'terapeuta', 'paciente'). Este rol se guarda en la tabla `profiles`.
--
-- CÓMO VERIFICAR Y CORREGIR TU ROL:
-- 1. Ve a tu panel de Supabase > "Table Editor" (Editor de Tablas).
-- 2. Selecciona la tabla `profiles`.
-- 3. Busca la fila con tu correo electrónico de prueba.
-- 4. Asegúrate de que la columna `role` tenga el valor `admin` o `terapeuta`.
-- 5. Si no es así, haz doble clic en la celda y cámbialo manualmente.
--
--
-- CAUSA #2: POLÍTICAS DE SEGURIDAD (RLS) FALTANTES O INCORRECTAS
-- -----------------------------------------------------------------
-- Row Level Security (RLS) son las reglas que dicen "quién puede hacer qué".
-- Si no están activadas o son incorrectas, la base de datos rechazará
-- las acciones, incluso si tu rol es el correcto.
--
-- CÓMO VERIFICAR Y CORREGIR RLS:
-- 1. Ve a tu panel de Supabase > "Authentication" (Autenticación) > "Policies".
-- 2. Busca la tabla `content` en la lista.
-- 3. Deberías ver políticas separadas para SELECT, INSERT, UPDATE y DELETE.
--    Si no hay políticas o solo hay una general, necesitas crearlas.
-- 4. Asegúrate de que RLS esté "Enabled" (Habilitado) para la tabla.
--
-- Para una guía completa sobre cómo crear estas políticas, consulta la
-- documentación oficial de Supabase sobre RLS. La política clave para
-- eliminar contenido debería permitir la acción DELETE para roles
-- 'admin' y 'terapeuta'.
--
-- =====================================================================
*/

import { supabase } from '../supabase';
// FIX: Removed unexported `StorageError` from imports.
import type { User as AuthUser, Session, AuthResponse, AuthError, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';
import { User, Role, ContentItem, ProgressData, TodoItem, ActivityLog, PromotionalItem } from '../types';

type UserFormData = Partial<User> & { password?: string, photoFile?: File };

const API_TIMEOUT = 120000; // 120 segundos (2 minutos)

// FIX: Changed `promise` parameter type from `Promise<T>` to `PromiseLike<T>` to correctly handle Supabase's "thenable" query builders.
export const withTimeout = <T>(promise: PromiseLike<T>, ms: number): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`La operación tardó demasiado en responder (más de ${ms / 1000} segundos). Esto puede deberse a un problema de conexión o a que la base de datos del proyecto no está activa.`));
        }, ms);

        promise.then(
            (res) => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            (err) => {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    });
};


export const supabaseService = {
  login: async (email: string, password: string): Promise<{ session: Session | null; user: AuthUser | null; }> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<AuthResponse>(supabase.auth.signInWithPassword({ email, password }), API_TIMEOUT);
    if (error) throw error;
    return data;
  },

  logout: async (): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    // FIX: Explicitly provide generic type argument to withTimeout to fix type inference.
    const { error } = await withTimeout<{ error: AuthError | null }>(supabase.auth.signOut(), API_TIMEOUT);
    if (error) throw error;
  },

  register: async (name: string, email: string, password: string): Promise<{ user: AuthUser | null; session: Session | null }> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<AuthResponse>(supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    }), API_TIMEOUT);
    if (error) throw error;
    return data;
  },
  
  createUser: async (userData: UserFormData, therapistId?: string): Promise<User> => {
      if (!supabase) throw new Error("Supabase client not initialized.");
      if (!userData.email || !userData.password) throw new Error("Email and password are required.");
      
      // FIX: Explicitly provide generic type argument to withTimeout to fix type inference.
      const { data: authData, error: authError } = await withTimeout<AuthResponse>(supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
              data: {
                  name: userData.name,
              },
          },
      }), API_TIMEOUT);

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario.");

      const userId = authData.user.id;
      let photoUrl: string | undefined = undefined;

      if (userData.photoFile) {
          const filePath = `patient_photos/${userId}/${userData.photoFile.name}`;
          // FIX(line:372): Replaced `AuthError` with `any` for the error type, as Supabase's `StorageError` is not compatible and not exported.
          const { error: uploadError } = await withTimeout<{ data: { path: string } | null; error: any }>(supabase.storage
              .from('user-assets')
              .upload(filePath, userData.photoFile), API_TIMEOUT);

          if (uploadError) {
              console.error("Error subiendo la foto, continuando sin ella:", uploadError);
          } else {
              const { data: urlData } = supabase.storage.from('user-assets').getPublicUrl(filePath);
              photoUrl = urlData.publicUrl;
          }
      }

      const profileUpdates: Partial<User> = {
          name: userData.name,
          email: userData.email,
          photo_url: photoUrl,
          family_history: userData.family_history,
          significant_figures: userData.significant_figures,
          traumatic_events: userData.traumatic_events,
          dsm_v_diagnosis: userData.dsm_v_diagnosis,
          treatment_plan: userData.treatment_plan,
          follow_up_and_control: userData.follow_up_and_control,
          therapistId: therapistId,
      };
      
      // If a role is provided (by an admin), include it in the update.
      // The DB trigger will first assign 'paciente', this will override it.
      if (userData.role) {
          profileUpdates.role = userData.role;
      }
      
      const { data: profileData, error: profileError } = await withTimeout<PostgrestSingleResponse<User>>(supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId)
          .select()
          .single(), API_TIMEOUT);

      if (profileError) throw profileError;

      return profileData as User;
  },

  getUserProfile: async (authUser: AuthUser): Promise<User> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const { data: existingProfile, error: getError } = await withTimeout<PostgrestSingleResponse<User>>(supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single(), API_TIMEOUT);

    if (getError && getError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw getError;
    }

    if (existingProfile) {
        return existingProfile as User;
    }

    // Profile does not exist, create it.
    console.warn(`Profile for user ${authUser.id} not found. Creating one.`);

    // FIX: Explicitly provide a generic type argument to withTimeout to ensure correct type inference for `count` and `error`.
    const { count, error: countError } = await withTimeout<PostgrestResponse<User>>(supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }), API_TIMEOUT);

    if (countError) {
        console.error("Error counting profiles to determine role:", countError);
        throw countError;
    }

    const newRole = (count === null || count === 0) ? Role.Admin : Role.Patient;

    const profileData = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Nuevo Usuario',
        role: newRole,
    };

    const { data: newProfile, error: insertError } = await withTimeout<PostgrestSingleResponse<User>>(supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single(), API_TIMEOUT);

    if (insertError) {
        console.error("Error creating missing profile:", insertError);
        throw insertError;
    }

    return newProfile as User;
  },

  getUsers: async (): Promise<User[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestResponse<User>>(supabase.from('profiles').select('*'), API_TIMEOUT);
    if (error) throw error;
    return data as User[];
  },

  getPatientsForTherapist: async (therapistId: string): Promise<User[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestResponse<User>>(supabase
      .from('profiles')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('role', Role.Patient), API_TIMEOUT);
    if (error) throw error;
    return data as User[];
  },

  deleteUser: async (userId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await withTimeout<PostgrestResponse<never>>(supabase.from('profiles').delete().eq('id', userId), API_TIMEOUT);
    if (error) throw error;
  },
  
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<User>>(supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single(), API_TIMEOUT);
    if (error) throw error;
    return data as User;
  },

  getContent: async (): Promise<ContentItem[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestResponse<ContentItem>>(supabase.from('content').select('*').order('id'), API_TIMEOUT);
    if (error) throw error;
    return data as ContentItem[];
  },
  
  addContent: async (itemData: Omit<ContentItem, 'id' | 'authorId'>, authorId: string): Promise<ContentItem> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    const contentToInsert = {
      ...itemData,
      day: Number(itemData.day),
      author_id: authorId,
    };

    const { data, error: insertError } = await withTimeout<PostgrestSingleResponse<ContentItem>>(supabase
      .from('content')
      .insert(contentToInsert)
      .select()
      .single(), API_TIMEOUT);

    if (insertError) {
      throw insertError;
    }

    return data as ContentItem;
  },

  deleteContent: async (contentId: number): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    
    // The error object will be populated on failure, e.g. RLS violation.
    // If the row doesn't exist, Supabase delete doesn't error out, which is acceptable.
    const { error } = await withTimeout<PostgrestResponse<never>>(supabase
      .from('content')
      .delete()
      .eq('id', contentId), API_TIMEOUT);
    
    if (error) {
      // Propagate the specific Supabase error for the UI to handle.
      throw error;
    }
  },

  getProgressData: async (userId: string): Promise<ProgressData[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    // NOTE: This implementation has been reverted to client-side aggregation.
    // The previous implementation used a database RPC ('get_daily_progress_report'),
    // which was failing with a "column 'mood' does not exist" error. This indicates
    // a potential mismatch between the application's expected database schema and the
    // deployed schema.
    // This client-side version is more resilient to schema variations (e.g., using
    // 'rating' as a fallback for 'mood') and will prevent the app from crashing.
    // However, it may be slower for users with a very long activity history.
    // For a long-term fix, the 'get_daily_progress_report' RPC function and the
    // 'activity_logs' table schema in Supabase should be inspected and aligned.

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs, error } = await withTimeout<PostgrestResponse<ActivityLog>>(
        supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', thirtyDaysAgo.toISOString()),
        API_TIMEOUT
    );

    if (error) {
        // The error from the RPC was "column mood does not exist". If a simple select
        // also fails, we re-throw it.
        throw error;
    }
    if (!logs) {
        return [];
    }

    const logsTyped = logs as ActivityLog[];

    const groupedByDate: { [key: string]: { mood: number[], anxiety: number[], stress: number[], count: number } } = {};

    for (const log of logsTyped) {
        const date = new Date(log.created_at).toISOString().split('T')[0];
        if (!groupedByDate[date]) {
            groupedByDate[date] = { mood: [], anxiety: [], stress: [], count: 0 };
        }
        
        // Use 'rating' as a fallback for 'mood' for backward compatibility or schema differences.
        const moodValue = log.mood ?? log.rating;

        if (moodValue !== null && typeof moodValue !== 'undefined') {
            groupedByDate[date].mood.push(moodValue);
        }
        if (log.anxiety !== null && typeof log.anxiety !== 'undefined') {
            groupedByDate[date].anxiety.push(log.anxiety);
        }
        if (log.stress !== null && typeof log.stress !== 'undefined') {
            groupedByDate[date].stress.push(log.stress);
        }
        groupedByDate[date].count++;
    }

    const sortedEntries = Object.entries(groupedByDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

    const progressData: ProgressData[] = sortedEntries.map(([date, values]) => {
        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 3; // Default to neutral 3 if no data for the day
        
        return {
            date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            mood: avg(values.mood),
            anxiety: avg(values.anxiety),
            stress: avg(values.stress),
            completedTasks: values.count,
        };
    });

    return progressData;
  },

  getTodosForUser: async (userId: string): Promise<TodoItem[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestResponse<TodoItem>>(supabase.from('todos').select('*').eq('user_id', userId).order('created_at'), API_TIMEOUT);
    if (error) throw error;
    return data as TodoItem[];
  },

  addTodo: async (text: string, userId: string): Promise<TodoItem> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<TodoItem>>(supabase.from('todos').insert({ text, user_id: userId }).select().single(), API_TIMEOUT);
    if (error) throw error;
    return data as TodoItem;
  },

  updateTodo: async (todoId: string, completed: boolean): Promise<TodoItem> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<TodoItem>>(supabase.from('todos').update({ completed }).eq('id', todoId).select().single(), API_TIMEOUT);
    if (error) throw error;
    return data as TodoItem;
  },

  deleteTodo: async (todoId: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await withTimeout<PostgrestResponse<never>>(supabase.from('todos').delete().eq('id', todoId), API_TIMEOUT);
    if (error) throw error;
  },
  
  setTodoReminder: async (todoId: string, reminderAt: string | null, reminderType: 'push' | 'email' | null): Promise<TodoItem> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<TodoItem>>(supabase
      .from('todos')
      .update({ reminder_at: reminderAt, reminder_type: reminderAt ? reminderType : null })
      .eq('id', todoId)
      .select()
      .single(), API_TIMEOUT);
    if (error) throw error;
    return data as TodoItem;
  },

  updateTodoText: async (todoId: string, text: string): Promise<TodoItem> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<TodoItem>>(supabase
      .from('todos')
      .update({ text })
      .eq('id', todoId)
      .select()
      .single(), API_TIMEOUT);
    if (error) throw error;
    return data as TodoItem;
  },

  logActivityCompletion: async (log: { userId: string; contentId: number; reflection: string; mood: number, anxiety: number, stress: number }): Promise<ActivityLog> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<ActivityLog>>(supabase
      .from('activity_logs')
      .insert({
        user_id: log.userId,
        content_id: log.contentId,
        reflection: log.reflection,
        mood: log.mood,
        anxiety: log.anxiety,
        stress: log.stress,
        rating: log.mood, // Use mood as the general rating for backwards compatibility
      })
      .select()
      .single(), API_TIMEOUT);
    if (error) throw error;
    return data as ActivityLog;
  },

  getActivityLogsForPatient: async (patientId: string): Promise<ActivityLog[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestResponse<ActivityLog>>(supabase
      .from('activity_logs')
      .select('*, content(title)')
      .eq('user_id', patientId)
      .order('created_at', { ascending: false }), API_TIMEOUT);
    if (error) throw error;
    return data as ActivityLog[];
  },

  // New functions for settings
  getSetting: async (key: string): Promise<string | null> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<{ value: string }>>(supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single(), API_TIMEOUT);
    if (error) {
        if (error.code === 'PGRST116') return null; // Not found is okay
        throw error;
    }
    return data?.value || null;
  },
  
  updateSetting: async (key: string, value: string): Promise<void> => {
      if (!supabase) throw new Error("Supabase client not initialized.");
      const { error } = await withTimeout<PostgrestResponse<never>>(supabase
          .from('settings')
          .upsert({ key, value, updated_at: new Date().toISOString() }), API_TIMEOUT);
      if (error) throw error;
  },

  uploadAppAsset: async (filePath: string, file: File): Promise<string> => {
      if (!supabase) throw new Error("Supabase client not initialized.");
      // FIX(line:655): Replaced `AuthError` with `any` for the error type, as Supabase's `StorageError` is not compatible and not exported.
      const { error: uploadError } = await withTimeout<{ data: { path: string } | null; error: any }>(supabase.storage
          .from('app-assets')
          .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
          }), API_TIMEOUT);
      
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('app-assets').getPublicUrl(filePath);
      // Add a timestamp to bust the cache immediately after upload
      return `${urlData.publicUrl}?t=${new Date().getTime()}`;
  },

  // Promotional Items
  getPromotionalItems: async (): Promise<PromotionalItem[]> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestResponse<PromotionalItem>>(supabase.from('promotional_items').select('*').order('created_at', { ascending: false }), API_TIMEOUT);
    if (error) throw error;
    return data as PromotionalItem[];
  },

  getActivePromotionalItem: async (): Promise<PromotionalItem | null> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<PromotionalItem>>(supabase.from('promotional_items').select('*').eq('is_active', true).limit(1).single(), API_TIMEOUT);
    if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows found" error
    return data as PromotionalItem | null;
  },

  addPromotionalItem: async (item: Omit<PromotionalItem, 'id' | 'author_id'>, authorId: string): Promise<PromotionalItem> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { data, error } = await withTimeout<PostgrestSingleResponse<PromotionalItem>>(supabase
      .from('promotional_items')
      .insert({ ...item, author_id: authorId })
      .select()
      .single(), API_TIMEOUT);
    if (error) throw error;
    return data as PromotionalItem;
  },

  updatePromotionalItem: async (id: number, updates: Partial<PromotionalItem>): Promise<PromotionalItem> => {
    if (!supabase) throw new Error("Supabase client not initialized.");

    // If we are activating an item, we must deactivate all others first.
    if (updates.is_active === true) {
      const { error: deactivateError } = await supabase
        .from('promotional_items')
        .update({ is_active: false })
        .eq('is_active', true);
      if (deactivateError) console.error("Could not deactivate other items:", deactivateError);
    }

    const { data, error } = await withTimeout<PostgrestSingleResponse<PromotionalItem>>(supabase
      .from('promotional_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single(), API_TIMEOUT);
    if (error) throw error;
    return data as PromotionalItem;
  },

  deletePromotionalItem: async (id: number): Promise<void> => {
    if (!supabase) throw new Error("Supabase client not initialized.");
    const { error } = await withTimeout<PostgrestResponse<never>>(supabase.from('promotional_items').delete().eq('id', id), API_TIMEOUT);
    if (error) throw error;
  },
};