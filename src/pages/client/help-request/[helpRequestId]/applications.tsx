
import { useParams } from 'react-router-dom';
import Layout from '../../../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import FilterTabs from '../../../../components/applications/FilterTabs';
import SortDropdown from '../../../../components/applications/SortDropdown';
import ApplicationsList from '../../../../components/applications/ApplicationsList';
import { useTicketApplications } from '../../../../hooks/useTicketApplications';

const ManageApplicationsPage = () => {
  const { helpRequestId } = useParams();
  
  const {
    applications,
    isLoading,
    error,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
  } = useTicketApplications(helpRequestId as string);

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
              <FilterTabs 
                value={statusFilter} 
                onValueChange={setStatusFilter} 
              />
              <SortDropdown 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value as 'created_at' | 'match_score')} 
              />
            </div>

            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <ApplicationsList 
                applications={applications}
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
