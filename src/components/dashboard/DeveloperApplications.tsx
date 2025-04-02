
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpRequestMatch, ApplicationStatus } from '../../types/helpRequest';
import { updateApplicationStatus, VALID_MATCH_STATUSES } from '../../integrations/supabase/helpRequestsApplications';
import { toast } from 'sonner';
import ApplicationCard from './ApplicationCard';
import ApprovalDialog from './ApprovalDialog';
import { getDeveloperName, getDeveloperImage } from '../../utils/developerUtils';

interface DeveloperApplicationsProps {
  applications: any[];
  requestId: string;
  clientId: string;
  onApplicationUpdate: () => void;
  onOpenChat: (developerId: string, applicationId: string) => void;
}

const DeveloperApplications: React.FC<DeveloperApplicationsProps> = ({ 
  applications, 
  requestId,
  clientId,
  onApplicationUpdate,
  onOpenChat
}) => {
  const navigate = useNavigate();
  const [processingApplicationIds, setProcessingApplicationIds] = useState<string[]>([]);
  const [approvedApplication, setApprovedApplication] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const handleApprove = async (applicationId: string) => {
    try {
      setProcessingApplicationIds(prev => [...prev, applicationId]);
      toast.loading('Approving application...');
      
      // Make sure we're using the exact value from our constants that match the database constraint
      const statusValue = VALID_MATCH_STATUSES.APPROVED;
      console.log('Approving application with status:', statusValue);
      
      const result = await updateApplicationStatus(
        applicationId, 
        statusValue as ApplicationStatus, 
        clientId
      );
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application approved successfully!');
        
        const approved = applications.find(app => app.id === applicationId);
        if (approved) {
          setApprovedApplication(approved);
          setShowSuccessDialog(true);
        }
        
        onApplicationUpdate();
      } else {
        toast.error(`Failed to approve application: ${result.error}`);
        console.error('Error details:', result);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while approving the application');
      console.error('Error approving application:', error);
    } finally {
      setProcessingApplicationIds(prev => prev.filter(id => id !== applicationId));
    }
  };
  
  const handleReject = async (applicationId: string) => {
    try {
      setProcessingApplicationIds(prev => [...prev, applicationId]);
      toast.loading('Rejecting application...');
      
      // Make sure we're using the exact value from our constants that match the database constraint
      const statusValue = VALID_MATCH_STATUSES.REJECTED;
      console.log('Rejecting application with status:', statusValue);
      
      const result = await updateApplicationStatus(
        applicationId, 
        statusValue as ApplicationStatus, 
        clientId
      );
      
      toast.dismiss();
      
      if (result.success) {
        toast.success('Application rejected successfully.');
        onApplicationUpdate();
      } else {
        toast.error(`Failed to reject application: ${result.error}`);
        console.error('Error details:', result);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred while rejecting the application');
      console.error('Error rejecting application:', error);
    } finally {
      setProcessingApplicationIds(prev => prev.filter(id => id !== applicationId));
    }
  };
  
  const handleStartChat = (developerId: string, applicationId: string) => {
    onOpenChat(developerId, applicationId);
    setShowSuccessDialog(false);
  };

  const isProcessing = (applicationId: string) => {
    return processingApplicationIds.includes(applicationId);
  };

  if (applications.length === 0) {
    return (
      <div className="bg-background p-6 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">👨‍💻</div>
        <h3 className="text-xl font-medium mb-2">No developer applications yet</h3>
        <p className="text-muted-foreground mb-4">
          When developers apply to your request, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((application) => (
          <ApplicationCard 
            key={application.id}
            application={application}
            onApprove={handleApprove}
            onReject={handleReject}
            onOpenChat={onOpenChat}
            isProcessing={isProcessing}
          />
        ))}
      </div>

      <ApprovalDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        approvedApplication={approvedApplication}
        onStartChat={handleStartChat}
        getDeveloperName={getDeveloperName}
        getDeveloperImage={getDeveloperImage}
      />
    </>
  );
};

export default DeveloperApplications;
