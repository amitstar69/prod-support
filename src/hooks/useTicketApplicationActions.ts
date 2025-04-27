
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { MATCH_STATUSES } from '../utils/constants/statusConstants';

export const useTicketApplicationActions = () => {
  const approveApplication = async (applicationId: string, developerId: string, requestId: string) => {
    try {
      toast.loading('Processing application approval...');
      
      // Update selected developer's application status
      const { error: approveError } = await supabase
        .from('help_request_matches')
        .update({ status: MATCH_STATUSES.APPROVED_BY_CLIENT })
        .eq('id', applicationId);

      if (approveError) {
        toast.dismiss();
        toast.error(`Failed to approve application: ${approveError.message}`);
        return false;
      }

      // Update help request status and set selected developer
      const { error: requestError } = await supabase
        .from('help_requests')
        .update({
          status: 'approved',
          selected_developer_id: developerId
        })
        .eq('id', requestId);

      if (requestError) {
        toast.dismiss();
        toast.error(`Failed to update help request: ${requestError.message}`);
        return false;
      }

      // Reject all other pending applications
      const { error: rejectError } = await supabase
        .from('help_request_matches')
        .update({ status: MATCH_STATUSES.REJECTED_BY_CLIENT })
        .eq('request_id', requestId)
        .neq('id', applicationId)
        .eq('status', 'pending');

      if (rejectError) {
        toast.dismiss();
        toast.error(`Failed to reject other applications: ${rejectError.message}`);
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
