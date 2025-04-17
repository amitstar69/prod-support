
export const validateEmail = (email: string): { isValid: boolean; error: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: '' };
};

export const validatePassword = (password: string): { isValid: boolean; error: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true, error: '' };
};
