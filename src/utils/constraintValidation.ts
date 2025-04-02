
/**
 * Utility function to validate that a value matches a set of allowed values
 * 
 * @param value The value to validate
 * @param allowedValues Array of allowed values
 * @param fieldName Name of the field (for error messaging)
 * @returns Either the validated value or throws an error
 */
export function validateConstraint<T>(value: T, allowedValues: readonly T[], fieldName: string): T {
  if (allowedValues.includes(value)) {
    return value;
  }
  
  throw new Error(
    `Invalid ${fieldName} value: "${value}". Must be one of: ${allowedValues.join(', ')}`
  );
}

/**
 * Type guard to check if a value is included in a set of allowed values
 */
export function isValueAllowed<T>(value: T, allowedValues: readonly T[]): boolean {
  return allowedValues.includes(value);
}
