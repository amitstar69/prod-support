
import { DeveloperProfile } from '../types/helpRequest';

/**
 * Type guard to check if an object has the shape of a DeveloperProfile
 */
export function isDeveloperProfile(obj: any): obj is DeveloperProfile {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'skills' in obj &&
    'experience' in obj &&
    'hourly_rate' in obj
  );
}

/**
 * Safely get a property value from an object with fallback
 */
export function safelyGetProperty<T>(obj: any, prop: string, fallback: T): T {
  if (!obj || typeof obj !== 'object' || !(prop in obj)) {
    return fallback;
  }
  
  const value = obj[prop];
  return value === null || value === undefined ? fallback : value as T;
}
