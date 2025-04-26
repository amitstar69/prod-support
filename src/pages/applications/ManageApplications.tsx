
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDeveloperApplications } from '../../hooks/applications/useDeveloperApplications';
import { FilterTabs } from '../../components/applications/FilterTabs';
import { SortDropdown } from '../../components/applications/SortDropdown';
import { ApplicationsList } from '../../components/applications/ApplicationsList';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { HelpRequestMatch } from '../../types/helpRequest';

type Status = 'all' | 'pending' | 'approved' | 'rejected';
type SortOption = 'newest' | 'oldest' | 'rating';

export const ManageApplications = () => {
  const { helpRequestId } = useParams<{ helpRequestId: string }>();
  const { applications, isLoading, error } = useDeveloperApplications(helpRequestId || '');
  const [status, setStatus] = useState<Status>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const handleApprove = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (error) throw error;
      toast.success('Application approved successfully');
    } catch (err) {
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;
      toast.success('Application rejected');
    } catch (err) {
      toast.error('Failed to reject application');
    }
  };

  const filteredApplications = applications
    .filter((app: HelpRequestMatch) => status === 'all' || app.status === status)
    .sort((a: HelpRequestMatch, b: HelpRequestMatch) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
      }
      return 0;
    });

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load applications
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Applications</h1>
        <p className="text-muted-foreground">Request ID: {helpRequestId}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <FilterTabs currentStatus={status} onStatusChange={setStatus} />
        <SortDropdown value={sortBy} onValueChange={setSortBy} />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading applications...</div>
      ) : (
        <ApplicationsList 
          applications={filteredApplications}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};
