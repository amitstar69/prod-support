
import React, { useState, useEffect } from 'react';
import DeveloperApplicationPanel from '../developer-ticket-detail/DeveloperApplicationPanel';
import StatusActionCard from './StatusActionCard';
import TicketHistoryPanel from './TicketHistoryPanel';
import { HelpRequest } from '../../types/helpRequest';
import { getCurrentUserData } from '../../contexts/auth';
import { Loader2 } from 'lucide-react';

interface SidebarContentProps {
  isDeveloper: boolean;
  ticket: HelpRequest;
  ticketId: string;
  applicationStatus: string | null;
  hasApplied: boolean;
  onApply: () => void;
  onRefresh: () => Promise<void>;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isDeveloper,
  ticket,
  ticketId,
  applicationStatus,
  hasApplied,
  onApply,
  onRefresh
}) => {
  const [developerProfile, setDeveloperProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchDeveloperProfile = async () => {
      if (isDeveloper) {
        try {
          const userData = await getCurrentUserData();
          setDeveloperProfile(userData);
        } catch (error) {
          console.error('Error fetching developer profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setIsLoadingProfile(false);
      }
    };

    fetchDeveloperProfile();
  }, [isDeveloper]);

  // Handle refresh as an async function to match the expected Promise<void> type
  const handleRefresh = async (): Promise<void> => {
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      {isDeveloper && ticket && (
        isLoadingProfile ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading your profile...</span>
          </div>
        ) : (
          <DeveloperApplicationPanel
            devUpdateVisibility={{
              show: !!(applicationStatus === "approved" && hasApplied),
              reason: "",
            }}
            ticket={ticket}
            ticketId={ticketId}
            userType={isDeveloper ? "developer" : "client"}
            applicationStatus={applicationStatus}
            hasApplied={hasApplied}
            onApply={onApply}
            fetchLatestTicketData={handleRefresh}
            isPaidDeveloper={developerProfile?.isPaidDeveloper ?? false}
            freeApplicationsRemaining={developerProfile?.freeApplicationsRemaining ?? 0}
            onUpgradeClick={() => window.location.href = '/developer/upgrade'}
          />
        )
      )}
      
      {ticket && (
        <StatusActionCard
          ticket={ticket}
          userType={isDeveloper ? "developer" : "client"}
          onStatusUpdated={handleRefresh}
        />
      )}
      
      <TicketHistoryPanel 
        ticketId={ticketId} 
        compact={true} 
        limit={5} 
      />
    </div>
  );
};

export default SidebarContent;
