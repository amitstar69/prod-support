import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../../integrations/supabase/client';
import { useAuth } from '../../../contexts/auth';
import Layout from '../../../components/Layout';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { useHelpRequestData } from '../../../hooks/help-request/useHelpRequestData';
import StatusActionCard from '../../../components/ticket-detail/StatusActionCard';
import DeveloperApplicationPanel from '../../../components/developer-ticket-detail/DeveloperApplicationPanel';

const TicketDetailsPage = () => {
  const { helpRequestId } = useParams();
  const { userType } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { ticket, isLoading, error, refetchTicket } = useHelpRequestData(helpRequestId);

  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  const handleViewApplications = () => {
    navigate(`/client/help-request/${helpRequestId}/applications`);
  };

  // Add these new state variables
  const [isPaidDeveloper, setIsPaidDeveloper] = useState(false);
  const [freeApplicationsRemaining, setFreeApplicationsRemaining] = useState(2);
  const role = userType as "client" | "developer";
  const { userId } = useAuth();

  useEffect(() => {
    if (userId && userType === 'developer') {
      // Fetch developer profile details
      const fetchDeveloperStatus = async () => {
        const { data: profile, error } = await supabase
          .from('developer_profiles')
          .select('is_paid_developer, free_applications_remaining')
          .eq('id', userId)
          .single();

        if (!error && profile) {
          setIsPaidDeveloper(profile.is_paid_developer);
          setFreeApplicationsRemaining(profile.free_applications_remaining);
        }
      };

      fetchDeveloperStatus();
    }
  }, [userId, userType]);

  useEffect(() => {
    if (!helpRequestId || !userId) return;

    const checkApplicationStatus = async () => {
      try {
        const { data: matchData, error: matchError } = await supabase
          .from('help_request_matches')
          .select('status')
          .eq('request_id', helpRequestId)
          .eq('developer_id', userId)
          .maybeSingle();

        if (matchError) {
          console.error('[TicketDetailPage] Error checking application status:', matchError);
          return;
        }

        if (matchData) {
          console.log('[TicketDetailPage] Application found with status:', matchData.status);
          setHasApplied(true);
          setApplicationStatus(matchData.status);
        } else {
          console.log('[TicketDetailPage] No application found');
          setHasApplied(false);
          setApplicationStatus(null);
        }
      } catch (err) {
        console.error('[TicketDetailPage] Exception checking application status:', err);
      }
    };

    checkApplicationStatus();
  }, [role, userId, helpRequestId]);

  const handleUpgradeClick = () => {
    navigate('/developer/upgrade');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
          </div>
          <p className="mt-6 text-muted-foreground">Loading ticket details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-semibold text-red-500">Error Loading Ticket</h2>
          <p className="mt-4 text-muted-foreground">{error || "Ticket not found"}</p>
        </div>
      </Layout>
    );
  }

  const handleApplyClick = () => {
    navigate(`/tickets/${helpRequestId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12 shadow-md">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              {ticket.title || "Ticket Details"}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl">
              View and manage the details of this help request
            </p>
          </div>
        </div>
        
        {userType === 'client' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Status Actions</h3>
            <StatusActionCard
              ticket={ticket}
              userType={userType}
              onStatusUpdated={refetchTicket}
            />
          </div>
        )}

        {userType === 'client' && 
         ticket.status === 'awaiting_client_approval' && 
         !ticket.selected_developer_id && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Developer Applications Pending</CardTitle>
              <CardDescription>
                Developers have applied to this request. Please review and approve a developer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate(`/client/help-request/${helpRequestId}/applications`)}
              >
                View Developer Applications
              </Button>
            </CardContent>
          </Card>
        )}

        {userType === 'developer' && (
          <DeveloperApplicationPanel
            devUpdateVisibility={{
              show: !!(applicationStatus === "approved" && hasApplied),
              reason: "",
            }}
            ticket={ticket}
            ticketId={helpRequestId}
            userType={role}
            applicationStatus={applicationStatus}
            hasApplied={hasApplied}
            onApply={handleApplyClick}
            fetchLatestTicketData={refetchTicket}
            isPaidDeveloper={isPaidDeveloper}
            freeApplicationsRemaining={freeApplicationsRemaining}
            onUpgradeClick={handleUpgradeClick}
          />
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Ticket Information</h3>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-muted-foreground">{ticket.description}</p>
            </div>
            <div>
              <span className="font-medium">Technical Area:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {ticket.technical_area?.map((area, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Urgency:</span>
              <span className="ml-2">{ticket.urgency}</span>
            </div>
            <div>
              <span className="font-medium">Budget Range:</span>
              <span className="ml-2">{ticket.budget_range}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetailsPage;
