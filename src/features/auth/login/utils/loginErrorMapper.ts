
export type LoginErrorCode = 
  | 'invalid_credentials' 
  | 'email_not_verified' 
  | 'user_type_mismatch'
  | 'account_locked'
  | 'network_error'
  | 'timeout_error'
  | 'server_error'
  | 'unexpected_error';

export interface MappedLoginError {
  code: LoginErrorCode;
  message: string;
  actionable?: boolean;
  action?: string;
}

export const mapLoginError = (error: string): MappedLoginError => {
  // Invalid credentials
  if (error.includes('credentials') || error.includes('incorrect') || error.includes('invalid login')) {
    return {
      code: 'invalid_credentials',
      message: 'Email or password is incorrect. Please check your credentials.',
      actionable: false
    };
  }
  
  // Email verification required
  if (error.includes('verify') || error.includes('verification') || error.includes('confirmed') || error.includes('not confirmed')) {
    return {
      code: 'email_not_verified',
      message: 'Please verify your email before logging in.',
      actionable: true,
      action: 'resend_verification'
    };
  }
  
  // User type mismatch
  if (error.includes('registered as a') || error.includes('not a') || error.includes('user type')) {
    return {
      code: 'user_type_mismatch',
      message: 'You are trying to log in with the wrong account type.',
      actionable: false
    };
  }
  
  // Account locked due to too many attempts
  if (error.includes('too many') || error.includes('attempts') || error.includes('locked')) {
    return {
      code: 'account_locked',
      message: 'Too many login attempts. Please try again later.',
      actionable: false
    };
  }
  
  // Network errors
  if (error.includes('Network') || error.includes('connection')) {
    return {
      code: 'network_error',
      message: 'Network error. Please check your internet connection and try again.',
      actionable: false
    };
  }
  
  // Timeout errors
  if (error.includes('timed out') || error.includes('timeout')) {
    return {
      code: 'timeout_error',
      message: 'Request timed out. Please try again later.',
      actionable: false
    };
  }
  
  // Server errors
  if (error.includes('server') || error.includes('500')) {
    return {
      code: 'server_error',
      message: 'Server error. Please try again later.',
      actionable: false
    };
  }
  
  // Default for unexpected errors
  return {
    code: 'unexpected_error',
    message: error || 'An unexpected error occurred.',
    actionable: false
  };
};

export const getDisplayErrorMessage = (error?: MappedLoginError): string => {
  return error ? error.message : '';
};
