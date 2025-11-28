// Re-exportar tipos desde types/index.ts para mantener compatibilidad
export * from './types/index';

// Alias para compatibilidad con código existente
export type { User as UserType } from './types/index';
export type { Content as ContentType } from './types/index';
export type { Task as TaskType } from './types/index';
