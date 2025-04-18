import { supabase } from '../../integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface LoginResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}

const profileCache = new Map<string, { user_type: string | null, timestamp: number }>();
const CACHE_EXPIRY = 15 * 60 * 1000;

const loginAttempts = new Map<string, { count: number, firstAttempt: number, locked: boolean, lockExpiry: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const ATTEMPT_WINDOW = 10 * 60 * 1000;

const isRateLimited = (email: string): { limited: boolean, message?: string } => {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!loginAttempts.has(normalizedEmail)) {
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
  }
  
  const record = loginAttempts.get(normalizedEmail)!;
  
  if (record.locked) {
    if (now >= record.lockExpiry) {
      loginAttempts.set(normalizedEmail, {
        count: 0,
        firstAttempt: now,
        locked: false,
        lockExpiry: 0
      });
      return { limited: false };
    }
    
    const remainingMinutes = Math.ceil((record.lockExpiry - now) / 60000);
    return { 
      limited: true, 
      message: `Too many login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`
    };
  }
  
  if (now - record.firstAttempt > ATTEMPT_WINDOW) {
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
  }
  
  return { limited: false };
};

const recordLoginAttempt = (email: string, success: boolean): void => {
  const now = Date.now();
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!loginAttempts.has(normalizedEmail)) {
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
  }
  
  const record = loginAttempts.get(normalizedEmail)!;
  
  if (success) {
    loginAttempts.set(normalizedEmail, {
      count: 0,
      firstAttempt: now,
      locked: false,
      lockExpiry: 0
    });
    return;
  }
  
  const newCount = record.count + 1;
  
  if (newCount >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(normalizedEmail, {
      count: newCount,
      firstAttempt: record.firstAttempt,
      locked: true,
      lockExpiry: now + LOCKOUT_DURATION
    });
    
    console.warn(`Account ${email} locked for ${LOCKOUT_DURATION/60000} minutes due to too many failed attempts`);
  } else {
    loginAttempts.set(normalizedEmail, {
      count: newCount,
      firstAttempt: record.firstAttempt,
      locked: false,
      lockExpiry: 0
    });
  }
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  userType: 'client' | 'developer',
  rememberMe: boolean = false
): Promise<LoginResult> => {
  try {
    console.time('login-process');
    console.log(`Attempting to log in as ${userType} with email:`, email);
    
    const rateLimitCheck = isRateLimited(email);
    if (rateLimitCheck.limited) {
      return {
        success: false,
        error: rateLimitCheck.message || 'Too many login attempts. Please try again later.'
      };
    }
    
    console.time('auth-signin');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      clearTimeout(timeoutId);
      console.timeEnd('auth-signin');

      if (error) {
        recordLoginAttempt(email, false);
        
        console.error('Login error:', error);
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please verify your email before logging in.',
            requiresVerification: true
          };
        }
        
        if (error.message.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Email or password is incorrect. Please check your credentials.',
          };
        }
        
        return {
          success: false,
          error: error.message,
        };
      }

      if (!data.user) {
        recordLoginAttempt(email, false);
        console.error('No user returned after login');
        return {
          success: false,
          error: 'Login failed. Please try again.',
        };
      }
      
      if (data.user.email_confirmed_at === null) {
        recordLoginAttempt(email, false);
        console.log('User email is not verified');
        await supabase.auth.signOut();
        
        return {
          success: false,
          error: 'Please verify your email before logging in.',
          requiresVerification: true
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Login request aborted due to timeout');
        return {
          success: false,
          error: 'Login request timed out. Please check your internet connection and try again.'
        };
      }
      throw error;
    }

    const userId = data.user.id;
    const cachedProfile = profileCache.get(userId);
    const now = Date.now();
    
    if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_EXPIRY) {
      console.log('Using cached profile data');
      
      if (cachedProfile.user_type !== userType) {
        recordLoginAttempt(email, false);
        console.error('User type mismatch (from cache):', cachedProfile.user_type, 'vs', userType);
        await supabase.auth.signOut();
        return {
          success: false,
          error: `You are registered as a ${cachedProfile.user_type}, not a ${userType}. Please use the correct login option.`,
        };
      }
      
      recordLoginAttempt(email, true);
      
      console.log('Login successful for', userType, '(cached validation)');
      console.timeEnd('login-process');
      return { success: true };
    }

    console.time('profile-fetch');
    
    const profileController = new AbortController();
    const profileTimeoutId = setTimeout(() => profileController.abort(), 8000);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    clearTimeout(profileTimeoutId);
    
    console.timeEnd('profile-fetch');

    if (profileError) {
      recordLoginAttempt(email, false);
      console.error('Error fetching user profile:', profileError);
      
      if (profileError.code === 'PGRST116') {
        toast.error('Your user profile is missing. Please contact support.');
        console.error('Profile not found for user', userId);
        await supabase.auth.signOut();
      }
      
      return {
        success: false,
        error: 'Error verifying user type. Please try again.',
      };
    }

    profileCache.set(userId, {
      user_type: profileData.user_type,
      timestamp: now
    });

    if (profileData.user_type !== userType) {
      recordLoginAttempt(email, false);
      console.error('User type mismatch:', profileData.user_type, 'vs', userType);
      await supabase.auth.signOut();
      return {
        success: false,
        error: `You are registered as a ${profileData.user_type}, not a ${userType}. Please use the correct login option.`,
      };
    }

    recordLoginAttempt(email, true);
    
    console.log('Login successful for', userType);
    console.timeEnd('login-process');
    return { success: true };
  } catch (error) {
    recordLoginAttempt(email, false);
    const authError = error as AuthError;
    console.error('Exception during login:', authError);
    console.timeEnd('login-process');
    
    if (authError.name === 'AbortError' || authError.message?.includes('timeout')) {
      return {
        success: false,
        error: 'Login request timed out. Please check your internet connection and try again.',
      };
    }
    
    return {
      success: false,
      error: authError.message || 'An unexpected error occurred during login.',
    };
  }
};

export const login = async (
  email: string, 
  password: string, 
  userType: 'developer' | 'client',
  rememberMe: boolean = false
): Promise<LoginResult> => {
  return await loginWithEmailAndPassword(email, password, userType, rememberMe);
};
