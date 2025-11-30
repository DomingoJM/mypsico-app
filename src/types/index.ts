// ==================== ENUMS ====================
export enum UserRole {
  Admin = 'admin',
  Therapist = 'therapist',
  Patient = 'patient'
}

export enum ContentType {
  Video = 'video',
  Audio = 'audio',
  Article = 'article',
  Exercise = 'exercise'
}

export enum ContentStatus {
  Draft = 'draft',
  Active = 'active',
  Archived = 'archived'
}

// ==================== INTERFACES ====================

// User/Profile
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  photo_url?: string;
  bio?: string;
  spiritual_path?: string;
  therapist_id?: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

// Content
export interface Content {
  id: number;
  title: string;
  description?: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;
  category?: string;
  featured: boolean;
  status: ContentStatus;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

// Promotional Resources
export interface PromoResource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url?: string;
  file_type: 'pdf' | 'image' | 'video' | 'other';
  is_public: boolean;
  download_count: number;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface PromoResourceFormData {
  title: string;
  description: string;
  file_url: string;
  thumbnail_url?: string;
  file_type: 'pdf' | 'image' | 'video' | 'other';
  is_public: boolean;
}

// Activity Logs
export interface ActivityLog {
  id: string;
  user_id: string;
  content_id: number;
  rating?: number;
  reflection?: string;
  created_at: string;
  content?: Content;
}

// ==================== ALIASES (para compatibilidad) ====================
export type ContentItem = Content;
export type Role = UserRole;