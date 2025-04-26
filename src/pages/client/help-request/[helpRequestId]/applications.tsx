
import { useParams } from 'react-router-dom';
import Layout from '../../../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import FilterTabs from '../../../../components/client/FilterTabs';
import SortDropdown from '../../../../components/client/SortDropdown';
import ApplicationsList from '../../../../components/client/ApplicationsList';
import { useTicketApplications } from '../../../../hooks/useTicketApplications';
import { useState } from 'react';
import { HelpRequestMatch } from '../../../../types/helpRequest';

type SortByType = 'match_score' | 'proposed_rate' | 'proposed_duration' | 'created_at';
type FilterByType = 'all' | 'pending' | 'approved' | 'rejected';

const ManageApplicationsPage = () => {
  const { helpRequestId } = useParams();
  const [sortBy, setSortBy] = useState<SortByType>('match_score');
  const [filterBy, setFilterBy] = useState<FilterByType>('all');
  
  const { applications, isLoading, error } = useTicketApplications(helpRequestId as string);

  const filteredApplications = applications.filter((app) => {
    if (filterBy === 'all') return true;
    return app.status === filterBy;
  });

  const sortedApplications = [...filteredApplications].sort((a: HelpRequestMatch, b: HelpRequestMatch) => {
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
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  const handleSortChange = (value: string) => {
    setSortBy(value as SortByType);
  };

  const handleFilterChange = (value: string) => {
    setFilterBy(value as FilterByType);
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

            {error ? (
              <div className="text-red-500">{error}</div>
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
