
import { toast } from 'sonner';
import { submitDeveloperApplication, getDeveloperApplicationsForRequest } from '../../integrations/supabase/helpRequestsApplications';

const MAX_RATE = 9.99;

export const useTicketApplicationActions = (
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  refreshTickets: () => void,
  fetchMyApplications: (isAuthenticated: boolean, userId: string | null) => Promise<void>
) => {
  const handleClaimTicket = async (ticketId: string) => {
    if (!isAuthenticated || !userId) {
      toast.error('You must be logged in to claim tickets');
      return;
    }
    if (userType !== 'developer') {
      toast.error('Only developers can claim tickets');
      return;
    }
    try {
      toast.loading('Processing your application...');
      const defaultRate = 5;
      const formattedRate = Math.min(Math.max(0, parseFloat(defaultRate.toFixed(2))), MAX_RATE);
      const defaultDuration = 60;

      const result = await submitDeveloperApplication(
        ticketId,
        userId as string,
        {
          proposed_message: "I'd like to help with your request. I have experience in this area.",
          proposed_duration: defaultDuration,
          proposed_rate: formattedRate
        }
      );

      toast.dismiss();
      if (result.success) {
        toast.success('Application submitted successfully!');
        refreshTickets();
        if (userId) {
          await fetchMyApplications(isAuthenticated, userId);
        }
      } else {
        toast.error(`Failed to submit application: ${result.error}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while processing your application');
    }
  };

  const checkApplicationStatus = async (ticketId: string, developerId: string): Promise<string | null> => {
    try {
      const result = await getDeveloperApplicationsForRequest(ticketId);
      if (result.success && result.data) {
        const myApplication = result.data.find(app => app.developer_id === developerId);
        return myApplication ? myApplication.status : null;
      }
      return null;
    } catch {
      return null;
    }
  };

  return { handleClaimTicket, checkApplicationStatus };
};
