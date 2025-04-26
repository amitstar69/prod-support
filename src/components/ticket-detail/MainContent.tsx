
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import TicketDetailsPanel from './TicketDetailsPanel';
import TicketCommentsPanel from './TicketCommentsPanel';
import TicketHistoryPanel from './TicketHistoryPanel';
import AttachmentsPanel from './AttachmentsPanel';
import DeveloperApplicationsPanel from '../dashboard/DeveloperApplicationsPanel';
import { HelpRequestMatch } from '../../types/helpRequest';

interface MainContentProps {
  ticket: any;
  ticketId: string;
  userId: string;
  isClient: boolean;
  applications: HelpRequestMatch[];
  isLoadingApplications: boolean;
  onRefresh: () => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  ticket,
  ticketId,
  userId,
  isClient,
  applications,
  isLoadingApplications,
  onRefresh,
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="attachments">Attachments</TabsTrigger>
        {isClient && applications.length > 0 && (
          <TabsTrigger value="applications">
            Applications
            {applications.filter(a => a.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200" variant="outline">
                {applications.filter(a => a.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="details">
        {ticket && <TicketDetailsPanel ticket={ticket} />}
      </TabsContent>
      
      <TabsContent value="comments">
        <TicketCommentsPanel ticketId={ticketId} />
      </TabsContent>
      
      <TabsContent value="history">
        <TicketHistoryPanel ticketId={ticketId} />
      </TabsContent>
      
      <TabsContent value="attachments">
        {ticket && <AttachmentsPanel ticket={ticket} />}
      </TabsContent>
      
      {isClient && (
        <TabsContent value="applications">
          <DeveloperApplicationsPanel
            applications={applications}
            ticketId={ticketId}
            clientId={userId}
            isLoading={isLoadingApplications}
            onApplicationUpdate={onRefresh}
            onOpenChat={(developerId, developerName) => 
              navigate(`/chat/${ticketId}?with=${developerId}&name=${developerName || 'Developer'}`)}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default MainContent;
