
import { HelpRequest } from '../types/helpRequest';

/**
 * Type guard to verify if an object is a valid HelpRequest
 * @param value The value to check
 * @returns Boolean indicating if the object is a valid HelpRequest
 */
export function isHelpRequest(value: unknown): value is HelpRequest {
  return (
    value !== null &&
    typeof value === 'object' &&
    'id' in value && typeof (value as any).id === 'string' &&
    'status' in value && typeof (value as any).status === 'string'
  );
}
