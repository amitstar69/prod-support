
import { DeveloperProfile, HelpRequest } from '../types/helpRequest';

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
 * Type guard to check if an object has the shape of a HelpRequest
 */
export function isHelpRequest(obj: unknown): obj is HelpRequest {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'status' in obj &&
    typeof (obj as any).status === 'string'
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
