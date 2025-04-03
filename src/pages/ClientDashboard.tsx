
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import Layout from '../components/Layout';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ChatDialog from '../components/chat/ChatDialog';
import EditHelpRequestForm from '../components/help/EditHelpRequestForm';
import CancelHelpRequestDialog from '../components/help/CancelHelpRequestDialog';
import HelpRequestHistoryDialog from '../components/help/HelpRequestHistoryDialog';
import { useClientDashboard } from '../hooks/dashboard/useClientDashboard';
import { getStatusIcon, getStatusDescription } from '../components/dashboard/DashboardStatusUtils';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import ActiveRequestsGrid from '../components/dashboard/ActiveRequestsGrid';
import CompletedRequestsGrid from '../components/dashboard/CompletedRequestsGrid';
import RequestDetailPanel from '../components/dashboard/RequestDetailPanel';

const ClientDashboard: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const {
    activeRequests,
    completedRequests,
    isLoading,
    requestMatches,
    selectedRequestId,
    selectedRequestApplications,
    selectedRequest,
    isChatOpen,
    chatDeveloperId,
    chatDeveloperName,
    selectedRequestForEdit,
    isEditDialogOpen,
    selectedRequestForCancel,
    isCancelDialogOpen,
    selectedRequestForHistory,
    isHistoryDialogOpen,
    handleViewRequest,
    handleCreateRequest,
    handleEditRequest,
    handleCancelRequest,
    handleViewHistory,
    handleOpenChat,
    handleApplicationUpdate,
    getApplicationCountForRequest,
    getTotalNewApplicationsCount,
    setSelectedRequestId,
    setIsChatOpen,
    setIsEditDialogOpen,
    setIsCancelDialogOpen,
    setIsHistoryDialogOpen,
    fetchHelpRequests,
  } = useClientDashboard(userId);

  const [activeTab, setActiveTab] = React.useState('active');

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/client-dashboard' } });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-secondary/30 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-1">Tickets Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage your help requests and developer applications
          </p>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        {selectedRequestId ? (
          <RequestDetailPanel
            selectedRequest={selectedRequest}
            selectedRequestApplications={selectedRequestApplications}
            onBack={() => setSelectedRequestId(null)}
            onApplicationUpdate={handleApplicationUpdate}
            onOpenChat={handleOpenChat}
            userId={userId || ''}
            selectedRequestId={selectedRequestId}
          />
        ) : (
          <>
            <DashboardHeader 
              activeRequestsCount={activeRequests.length}
              completedRequestsCount={completedRequests.length}
              onCreateRequest={handleCreateRequest}
              totalNewApplicationsCount={getTotalNewApplicationsCount()}
            />
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="active">
                  Active Requests
                  {getTotalNewApplicationsCount() > 0 && (
                    <div className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      {getTotalNewApplicationsCount()}
                    </div>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed">Completed Requests</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Loading your requests...</span>
                  </div>
                ) : (
                  <ActiveRequestsGrid
                    requests={activeRequests}
                    requestMatches={requestMatches}
                    isLoading={isLoading}
                    onViewRequest={handleViewRequest}
                    onEditRequest={handleEditRequest}
                    onViewHistory={handleViewHistory}
                    onCancelRequest={handleCancelRequest}
                    getApplicationCountForRequest={getApplicationCountForRequest}
                    getStatusIcon={getStatusIcon}
                    getStatusDescription={getStatusDescription}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-lg">Loading your requests...</span>
                  </div>
                ) : (
                  <CompletedRequestsGrid
                    requests={completedRequests}
                    isLoading={isLoading}
                    onViewRequest={handleViewRequest}
                    onViewHistory={handleViewHistory}
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
        
        <ChatDialog 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          helpRequestId={selectedRequestId || ''}
          otherId={chatDeveloperId}
          otherName={chatDeveloperName}
        />
      </div>
      
      {selectedRequestForEdit && (
        <EditHelpRequestForm
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          helpRequest={selectedRequestForEdit}
          onRequestUpdated={fetchHelpRequests}
        />
      )}
      
      {selectedRequestForCancel && (
        <CancelHelpRequestDialog
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          requestId={selectedRequestForCancel.id!}
          requestTitle={selectedRequestForCancel.title}
          onRequestCancelled={fetchHelpRequests}
        />
      )}
      
      {selectedRequestForHistory && (
        <HelpRequestHistoryDialog
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          requestId={selectedRequestForHistory.id!}
          requestTitle={selectedRequestForHistory.title}
        />
      )}
    </Layout>
  );
};

export default ClientDashboard;
