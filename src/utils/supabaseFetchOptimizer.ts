
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface FetchOptions<T> {
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  timeout?: number;
  onError?: (error: any) => void;
  onSuccess?: (data: T[]) => void;
}

/**
 * A utility function to optimize Supabase fetch operations with timeout handling
 * and consistent error management
 */
export const optimizedFetch = async <T>(
  supabase: SupabaseClient,
  options: FetchOptions<T>
): Promise<{ data: T[] | null; error: any }> => {
  const { 
    tableName, 
    select = '*', 
    filters = {}, 
    orderBy, 
    ascending = false,
    limit = 100,
    timeout = 10000,
    onError,
    onSuccess
  } = options;
  
  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`[Supabase Fetch] Fetching from ${tableName} with select: ${select}`);
    
    // Start building the query
    let query = supabase
      .from(tableName)
      .select(select);
    
    // Add filters if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    });
    
    // Add ordering if provided
    if (orderBy) {
      query = query.order(orderBy, { ascending });
    }
    
    // Add limit
    query = query.limit(limit);
    
    // Execute the query with timeout
    const { data, error } = await query.abortSignal(controller.signal);
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId);
    
    // Handle errors
    if (error) {
      console.error(`[Supabase Fetch] Error fetching from ${tableName}:`, error);
      if (onError) onError(error);
      return { data: null, error };
    }
    
    // Handle success
    console.log(`[Supabase Fetch] Successfully fetched ${data?.length ?? 0} records from ${tableName}`);
    if (onSuccess && data) onSuccess(data as T[]);
    
    return { data: data as T[], error: null };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error(`[Supabase Fetch] Request to ${tableName} timed out after ${timeout}ms`);
      const timeoutError = new Error(`Request timed out after ${timeout}ms`);
      if (onError) onError(timeoutError);
      return { data: null, error: timeoutError };
    }
    
    console.error(`[Supabase Fetch] Exception fetching from ${tableName}:`, error);
    if (onError) onError(error);
    return { data: null, error };
  }
};
