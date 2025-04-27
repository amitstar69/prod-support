
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { MATCH_STATUSES } from '../utils/constants/statusConstants';

export const useTicketApplicationActions = () => {
  const approveApplication = async (applicationId: string, developerId: string, requestId: string) => {
    try {
      toast.loading('Processing application approval...');
      
      // Start a transaction using the Supabase client
      const { error: updateError } = await supabase.rpc('approve_developer_application', {
        p_application_id: applicationId,
        p_developer_id: developerId,
        p_request_id: requestId
      });

      if (updateError) {
        toast.dismiss();
        toast.error(`Failed to approve application: ${updateError.message}`);
        return false;
      }

      toast.dismiss();
      toast.success('Developer approved successfully!');
      return true;
    } catch (error) {
      console.error('Error in approveApplication:', error);
      toast.dismiss();
      toast.error('An unexpected error occurred while approving the application');
      return false;
    }
  };

  const rejectApplication = async (applicationId: string) => {
    try {
      toast.loading('Processing application rejection...');

      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: MATCH_STATUSES.REJECTED_BY_CLIENT })
        .eq('id', applicationId);

      if (error) {
        toast.dismiss();
        toast.error(`Failed to reject application: ${error.message}`);
        return false;
      }

      toast.dismiss();
      toast.success('Application rejected successfully');
      return true;
    } catch (error) {
      console.error('Error in rejectApplication:', error);
      toast.dismiss();
      toast.error('An unexpected error occurred while rejecting the application');
      return false;
    }
  };

  return {
    approveApplication,
    rejectApplication
  };
};
