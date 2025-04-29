
import { useParams } from 'react-router-dom';
import Layout from '../../../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import FilterTabs from '../../../../components/client/FilterTabs';
import SortDropdown from '../../../../components/client/SortDropdown';
import ApplicationsList from '../../../../components/client/ApplicationsList';
import { useState } from 'react';
import { HelpRequestMatch } from '../../../../types/helpRequest';
import { Loader2 } from 'lucide-react';
import { useTicketApplications } from '../../../../hooks/useTicketApplications';

const ManageApplicationsPage = () => {
  const { helpRequestId } = useParams();
  const [sortBy, setSortBy] = useState<'match_score' | 'proposed_rate' | 'proposed_duration' | 'created_at'>('match_score');
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  const { 
    applications, 
    isLoading, 
    error, 
    statusFilter, 
    setStatusFilter,
    sortBy: apiSortBy,
    setSortBy: setApiSortBy
  } = useTicketApplications(helpRequestId as string);

  // Update filter in the API hook when local filter changes
  const handleFilterChange = (value: string) => {
    setFilterBy(value as typeof filterBy);
    setStatusFilter(value);
  };

  // Map local sort to API sort
  const handleSortChange = (value: string) => {
    setSortBy(value as typeof sortBy);
    
    // Only pass created_at or match_score to the API
    if (value === 'created_at' || value === 'match_score') {
      setApiSortBy(value);
    }
  };

  // Client-side sorting for fields not supported by the API
  const sortedApplications = [...applications].sort((a: HelpRequestMatch, b: HelpRequestMatch) => {
    if (sortBy === 'match_score') {
      return (b.match_score || 0) - (a.match_score || 0);
    }
    if (sortBy === 'proposed_rate') {
      return (a.proposed_rate || 0) - (b.proposed_rate || 0);
    }
    if (sortBy === 'proposed_duration') {
      return (a.proposed_duration || 0) - (b.proposed_duration || 0);
    }
    if (sortBy === 'created_at') {
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    }
    return 0;
  });

  const isProcessing = (applicationId: string) => {
    return processingIds.has(applicationId);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              Manage Applications
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Help Request #{helpRequestId}
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <FilterTabs onFilterChange={handleFilterChange} />
              <SortDropdown onSortChange={handleSortChange} />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : sortedApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {applications.length === 0 
                  ? 'No applications yet. Please check back soon.'
                  : 'No applications match the current filter criteria.'}
              </div>
            ) : (
              <ApplicationsList 
                applications={sortedApplications}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManageApplicationsPage;
