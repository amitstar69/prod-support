
import { supabase } from './client';

// Special test function to debug the database access with RLS policies
export const testRLSPolicies = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  
  if (!userId) {
    console.log('No authenticated user found. RLS policies require authentication.');
    return { authenticated: false };
  }
  
  try {
    console.log(`Testing RLS policies with user ID: ${userId}`);
    
    // Test SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('help_requests')
      .select('*')
      .limit(5);
      
    // Test INSERT  
    const testInsert = {
      title: 'RLS Test Request',
      description: 'Testing RLS policies',
      technical_area: ['Testing'],
      urgency: 'medium',
      communication_preference: ['Chat'],
      estimated_duration: 10,
      budget_range: '$50 - $100',
      client_id: userId,
      status: 'requirements'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('help_requests')
      .insert(testInsert)
      .select()
      .single();
      
    // If insert was successful, try to update
    let updateData = null;
    let updateError = null;
    let deleteData = null;
    let deleteError = null;
    
    if (insertData) {
      // Test UPDATE
      const { data: uData, error: uError } = await supabase
        .from('help_requests')
        .update({ title: 'Updated RLS Test Request' })
        .eq('id', insertData.id)
        .select()
        .single();
        
      updateData = uData;
      updateError = uError;
      
      // Test DELETE  
      const { data: dData, error: dError } = await supabase
        .from('help_requests')
        .delete()
        .eq('id', insertData.id)
        .select()
        .single();
        
      deleteData = dData;
      deleteError = dError;
    }
    
    // Return comprehensive results
    return {
      authenticated: true,
      userId,
      select: { success: !selectError, data: selectData, error: selectError },
      insert: { success: !insertError, data: insertData, error: insertError },
      update: { success: !updateError, data: updateData, error: updateError },
      delete: { success: !deleteError, data: deleteData, error: deleteError }
    };
    
  } catch (error) {
    console.error('Exception testing RLS policies:', error);
    return { authenticated: true, userId, error };
  }
};
