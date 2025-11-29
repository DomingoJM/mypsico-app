// Sistema de tipos unificado para MyPsico

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
  Exercise = 'exercise',
  Meditation = 'meditation'
}

export enum ContentStatus {
  Active = 'active',
  Draft = 'draft',
  Archived = 'archived'
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

export enum NotificationType {
  Reminder = 'reminder',
  NewContent = 'new_content',
  TaskAssigned = 'task_assigned',
  Message = 'message'
}

// ==================== INTERFACES DE USUARIO ====================
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  spiritual_path?: string;
  photo_url?: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface UserProfile extends User {
  phone?: string;
  birth_date?: string;
  emergency_contact?: string;
  notes?: string;
  therapist_id?: string;
}

// ==================== INTERFACES DE CONTENIDO ====================
export interface Content {
  id: number;
  title: string;
  description: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  category: string;
  featured: boolean;
  created_at: string;
  created_by: string;
  status: ContentStatus;
  tags?: string[];
  view_count?: number;
}

export interface ContentFormData {
  title: string;
  description: string;
  type: ContentType;
  url: string;
  thumbnail_url?: string;
  duration?: number;
  category: string;
  featured: boolean;
  status: ContentStatus;
  tags?: string[];
}

// ==================== INTERFACES DE TAREAS ====================
export interface Task {
  id: string;
  patient_id: string;
  therapist_id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  priority: TaskPriority;
  created_at: string;
  completed_at?: string;
  notes?: string;
}

export interface TaskFormData {
  patient_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
}

// ==================== INTERFACES DE RECORDATORIOS ====================
export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  datetime: string;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
  active: boolean;
  created_at: string;
  notification_sent?: boolean;
}

export interface ReminderFormData {
  title: string;
  description?: string;
  datetime: string;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
}

// ==================== INTERFACES DE CHAT ====================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  user_id?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  title?: string;
}

// ==================== INTERFACES DE DIARIO ====================
export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood?: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  created_at: string;
  updated_at: string;
  tags?: string[];
  is_private: boolean;
}

export interface JournalFormData {
  content: string;
  mood?: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  tags?: string[];
  is_private: boolean;
}

// ==================== INTERFACES DE NOTIFICACIONES ====================
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

// ==================== INTERFACES DE REPORTES ====================
export interface ProgressReport {
  id: string;
  patient_id: string;
  therapist_id: string;
  period_start: string;
  period_end: string;
  summary: string;
  completed_tasks: number;
  total_tasks: number;
  mood_average?: number;
  created_at: string;
  notes?: string;
}

export interface AnalyticsData {
  total_users: number;
  active_patients: number;
  total_content: number;
  popular_content: Content[];
  user_growth: Array<{ date: string; count: number }>;
  engagement_rate: number;
}

// ==================== INTERFACES DE RECURSOS PROMOCIONALES ====================
export interface PromoResource {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'pdf' | 'link';
  url: string;
  thumbnail_url?: string;
  category: string;
  download_count: number;
  created_at: string;
  created_by: string;
  is_public: boolean;
}

// ==================== TYPE GUARDS ====================
export const isAdmin = (user: User): boolean => user.role === UserRole.Admin;
export const isTherapist = (user: User): boolean => user.role === UserRole.Therapist;
export const isPatient = (user: User): boolean => user.role === UserRole.Patient;

// ==================== UTILITY TYPES ====================
export type ContentWithCreator = Content & {
  creator_name: string;
  creator_role: UserRole;
};

export type TaskWithPatient = Task & {
  patient_name: string;
  patient_email: string;
};

export type NotificationPreferences = {
  email_enabled: boolean;
  push_enabled: boolean;
  task_reminders: boolean;
  new_content_alerts: boolean;
  chat_notifications: boolean;
};

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ==================== FORM VALIDATION TYPES ====================
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}

// ==================== ALIAS PARA COMPATIBILIDAD ====================
// Alias para código existente que usa "Role" en lugar de "UserRole"
export { UserRole as Role };