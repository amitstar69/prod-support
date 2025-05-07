
import { DeveloperProfile } from '../types/helpRequest';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type guard to check if an object is a valid DeveloperProfile
 */
export function isDeveloperProfile(value: unknown): value is DeveloperProfile {
  return (
    value !== null && 
    typeof value === 'object' && 
    'id' in value &&
    !('code' in value) && 
    !('message' in value) &&
    !('details' in value) && 
    !('hint' in value)
  );
}

/**
 * Type guard to check if an object is a PostgrestError
 */
export function isPostgrestError(value: unknown): value is PostgrestError {
  return (
    value !== null && 
    typeof value === 'object' && 
    'code' in value && 
    'message' in value &&
    'details' in value
  );
}

/**
 * Safely access nested properties with fallbacks
 */
export function safelyGetProperty<T, K extends keyof T>(obj: T | null | undefined, key: K, fallback: T[K]): T[K] {
  if (obj && key in obj) {
    return obj[key];
  }
  return fallback;
}
