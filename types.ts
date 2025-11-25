


export enum Role {
  Admin = 'admin',
  Therapist = 'terapeuta',
  Patient = 'paciente',
}

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  therapistId?: string;
  spiritual_path?: string;
  primary_condition?: string;
  // Nuevos campos para la historia clínica
  photo_url?: string;
  family_history?: string;
  significant_figures?: string;
  traumatic_events?: string;
  dsm_v_diagnosis?: string;
  treatment_plan?: string;
  follow_up_and_control?: string;
}

export enum ContentType {
  Video = 'video',
  Audio = 'audio',
  Text = 'texto',
  Form = 'formulario',
}

export interface ContentItem {
  id: number;
  day: number;
  title: string;
  type: ContentType;
  content: string; // URL for video/audio, text content, or form definition
  // FIX: Add missing 'thumbnail_url' property to align with database schema and fix usage in components.
  thumbnail_url?: string;
  authorId: string;
  spiritual_path?: string;
  pathology?: string;
}

export interface ProgressData {
  date: string;
  mood: number;
  anxiety: number;
  stress: number;
  completedTasks: number;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  reminder_at?: string;
  reminder_type?: 'push' | 'email';
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text?: string; inlineData?: { mimeType: string; data: string } }[];
}

export interface ActivityLog {
  id: number;
  created_at: string;
  user_id: string;
  content_id: number;
  rating: number | null;
  reflection: string | null;
  mood: number | null;
  anxiety: number | null;
  stress: number | null;
  content?: { title: string }; // Optional: for joining data
}

export enum PromotionalItemType {
  Book = 'libro',
  Course = 'curso',
}

export interface PromotionalItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  external_link: string;
  item_type: PromotionalItemType;
  is_active: boolean;
  author_id: string;
  thematic?: string;
}