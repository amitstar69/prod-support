
import { supabase } from './client';

// Add a test function to directly check database access
export const testDatabaseAccess = async () => {
  try {
    console.log('[testDatabaseAccess] Running test...');
    
    // First check authentication status
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[testDatabaseAccess] Auth error:', sessionError);
      return { success: false, error: sessionError, authenticated: false };
    }
    
    if (!sessionData.session) {
      console.log('[testDatabaseAccess] No active session found');
      return { success: false, error: 'No active session', authenticated: false };
    }
    
    console.log('[testDatabaseAccess] User authenticated:', sessionData.session.user.id);
    console.log('[testDatabaseAccess] User metadata:', sessionData.session.user.user_metadata);
    
    // Try to count help_requests
    const { count, error: countError } = await supabase
      .from('help_requests')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('[testDatabaseAccess] Error counting help_requests:', countError);
      return { success: false, error: countError, authenticated: true };
    }
    
    console.log('[testDatabaseAccess] Help requests count:', count);
    
    // Try to fetch a few records
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('[testDatabaseAccess] Error fetching help_requests:', error);
      return { success: false, error, authenticated: true, count };
    }
    
    console.log('[testDatabaseAccess] Sample help requests:', data?.length);
    data?.forEach((item, i) => {
      console.log(`[testDatabaseAccess] Request ${i+1}:`, {
        id: item.id,
        title: item.title,
        status: item.status,
        client_id: item.client_id
      });
    });
    
    return { 
      success: true, 
      count, 
      sampleData: data?.length,
      authenticated: true
    };
  } catch (error) {
    console.error('[testDatabaseAccess] Exception:', error);
    return { success: false, error, authenticated: false };
  }
};
