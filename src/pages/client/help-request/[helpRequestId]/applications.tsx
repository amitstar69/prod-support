
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import FilterTabs from '../../../../components/applications/FilterTabs';
import SortDropdown from '../../../../components/applications/SortDropdown';
import ApplicationsList from '../../../../components/applications/ApplicationsList';
import { useTicketApplications } from '../../../../hooks/useTicketApplications';

const ManageApplicationsPage = () => {
  const router = useRouter();
  const { helpRequestId } = router.query;
  
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
                onValueChange={setSortBy} 
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
