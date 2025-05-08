import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TicketSection from '../components/dashboard/TicketSection';
import DeveloperApplicationsPanel from '../components/dashboard/DeveloperApplicationsPanel';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/auth';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import { Plus, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { HelpRequestMatch, HelpRequest } from '../types/helpRequest';
import { isClientCategories, ClientTicketCategories } from '../types/ticketCategories';
import PendingApplicationsBadge from '../components/dashboard/PendingApplicationsBadge';
import { getPendingApplicationsForClient } from '../integrations/supabase/helpRequestsCore/getHelpRequestMatches';
import { Skeleton } from '../components/ui/skeleton';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    pendingApproval: true,
    inProgress: true,
    completed: false
  });
  const [developerApplications, setDeveloperApplications] = useState<Record<string, HelpRequestMatch[]>>({});
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [pendingApplicationsCounts, setPendingApplicationsCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  // Fix the call to useDeveloperDashboard by not passing any arguments
  // This will use the default empty object from the implementation
  const dashboardData = useDeveloperDashboard();
  
  useEffect(() => {
    // Only show error message if we're still in error state after a delay
    // This prevents quick flashes of error messages during normal loading
    let errorTimeout: NodeJS.Timeout | null = null;
    
    if (dashboardData.hasError) {
      errorTimeout = setTimeout(() => {
        setShowErrorMessage(true);
      }, 3000); // Show error message after 3 seconds if still in error state
    } else {
      setShowErrorMessage(false);
    }
    
    return () => {
      if (errorTimeout) clearTimeout(errorTimeout);
    };
  }, [dashboardData.hasError]);
  
  // Get all tickets and categorize them based on status
  const categorizeTickets = (tickets: HelpRequest[]): ClientTicketCategories => {
    const activeTickets: HelpRequest[] = [];
    const pendingApprovalTickets: HelpRequest[] = [];
    const inProgressTickets: HelpRequest[] = [];
    const completedTickets: HelpRequest[] = [];
    
    if (!tickets || tickets.length === 0) {
      return { 
        activeTickets, 
        pendingApprovalTickets, 
        inProgressTickets, 
        completedTickets 
      };
    }
    
    tickets.forEach(ticket => {
      const status = (ticket.status || '').toLowerCase().replace(/-/g, '_');
      
      // Categorize based on status
      if (status === 'awaiting_client_approval') {
        pendingApprovalTickets.push(ticket);
      } else if (['approved', 'in_progress'].includes(status)) {
        inProgressTickets.push(ticket);
      } else if (['resolved', 'completed'].includes(status)) {
        completedTickets.push(ticket);
      } else if (['open', 'pending_match'].includes(status)) {
        activeTickets.push(ticket);
      } else {
        // Default to active for any other status
        activeTickets.push(ticket);
      }
    });
    
    return { 
      activeTickets, 
      pendingApprovalTickets, 
      inProgressTickets, 
      completedTickets 
    };
  };

  // Use the categorizedTickets from useDeveloperDashboard or categorize them manually
  const clientTickets = isClientCategories(dashboardData.categorizedTickets) 
    ? dashboardData.categorizedTickets 
    : categorizeTickets(Array.isArray(dashboardData.categorizedTickets) ? dashboardData.categorizedTickets : []);

  const activeTickets = clientTickets.activeTickets;
  const inProgressTickets = clientTickets.inProgressTickets;
  const completedTickets = clientTickets.completedTickets;
  const pendingApprovalTickets = clientTickets.pendingApprovalTickets;

  const toggleSection = (section: 'active' | 'pendingApproval' | 'inProgress' | 'completed') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!pendingApprovalTickets?.length || !isAuthenticated) return;
      
      try {
        setIsLoadingApplications(true);
        const ticketIds = pendingApprovalTickets.map(ticket => ticket.id);
        
        const applicationsByTicket: Record<string, HelpRequestMatch[]> = {};
        
        for (const ticketId of ticketIds) {
          if (!ticketId) continue;
          
          const { data, error } = await supabase
            .from('help_request_matches')
            .select(`
              *,
              profiles:developer_id (id, name, image)
            `)
            .eq('request_id', ticketId);
            
          if (error) {
            console.error('Error fetching developer applications:', error);
            continue;
          }
          
          if (data && data.length > 0) {
            const typedApplications: HelpRequestMatch[] = data.map(app => {
              let safeProfiles = app.profiles;
              
              if (!safeProfiles || typeof safeProfiles !== 'object') {
                safeProfiles = { 
                  id: app.developer_id, 
                  name: 'Unknown Developer',
                  image: null
                };
              } else if ('error' in safeProfiles) {
                safeProfiles = { 
                  id: app.developer_id, 
                  name: 'Unknown Developer',
                  image: null
                };
              }
              
              return {
                ...app,
                profiles: safeProfiles
              } as HelpRequestMatch;
            });
            
            applicationsByTicket[ticketId] = typedApplications;
          }
        }
        
        setDeveloperApplications(applicationsByTicket);
      } catch (err) {
        console.error('Error fetching developer applications:', err);
      } finally {
        setIsLoadingApplications(false);
      }
    };
    
    fetchApplications();
  }, [pendingApprovalTickets, isAuthenticated]);

  useEffect(() => {
    const fetchApplicationsCounts = async () => {
      if (!userId || !isAuthenticated) return;
      
      try {
        setIsLoadingCounts(true);
        console.log('[ClientDashboard] Fetching application counts for client:', userId);
        
        const response = await getPendingApplicationsForClient(userId);
        
        if (response.success && response.data) {
          console.log('[ClientDashboard] Fetched pending applications data:', response.data);
          setPendingApplicationsCounts(response.data);
        } else {
          console.error('[ClientDashboard] Failed to fetch pending applications:', response.error);
        }
      } catch (err) {
        console.error('[ClientDashboard] Exception fetching application counts:', err);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    if (userId && isAuthenticated) {
      const timer = setTimeout(() => {
        fetchApplicationsCounts();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    
    const channel = supabase
      .channel('client-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_request_matches'
        },
        () => {
          console.log('[ClientDashboard] Applications changed, refreshing data');
          fetchTickets(false);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, fetchTickets]);

  const handleOpenChat = (helpRequestId: string, developerId: string, developerName?: string) => {
    console.log('Opening chat for request:', helpRequestId, 'with developer:', developerId);
    navigate(`/chat/${helpRequestId}?with=${developerId}&name=${developerName || 'Developer'}`);
  };

  const handleViewDetails = (ticketId: string) => {
    const pendingCount = pendingApplicationsCounts[ticketId] ?? 0;
    console.log(`[ClientDashboard] Viewing ticket ${ticketId} with ${pendingCount} pending applications`);
    
    if (pendingCount > 0) {
      navigate(`/client/help-request/${ticketId}/applications`);
    } else {
      navigate(`/tickets/${ticketId}`);
    }
  };

  const createTicketPreview = (ticketList: any[], type: string) => {
    if (!ticketList) return null;
    
    const preview = ticketList.slice(0, 3);
    return (
      <>
        <TicketSection
          title=""
          tickets={preview}
          emptyMessage={`You don't have any ${type} help requests.`}
          onClaimTicket={handleClaimTicket}
          userId={userId}
          isAuthenticated={isAuthenticated}
          viewMode="grid"
          onOpenChat={handleOpenChat}
          onRefresh={fetchTickets}
        />
        
        {ticketList.length > 3 && (
          <div className="flex justify-end">
            <Button
              onClick={() => navigate('/client/tickets')}
              variant="outline"
              className="gap-2"
            >
              View All {ticketList.length} Tickets
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  const renderLoadingState = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="w-full">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <DashboardBanner />
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={dashboardData.showFilters} 
          setShowFilters={dashboardData.setShowFilters}
          onRefresh={fetchTickets}
          title="My Help Requests"
          description="Track and manage your help requests"
        />

        {dashboardData.isLoading ? (
          renderLoadingState()
        ) : showErrorMessage && dashboardData.hasError ? (
          <div className="p-8 text-center">
            <p className="text-red-500 mb-4">Failed to fetch your help requests.</p>
            <Button onClick={dashboardData.handleForceRefresh}>Try Again</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Collapsible 
              open={expandedSections.active} 
              onOpenChange={() => toggleSection('active')}
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Active Help Requests</h2>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {activeTickets?.length || 0}
                  </Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {expandedSections.active ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="p-4">
                {activeTickets && activeTickets.length > 0 ? (
                  <div className="space-y-4">
                    {activeTickets.map(ticket => (
                      <div key={ticket.id} className="bg-white p-4 rounded-lg border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium">{ticket.title}</h3>
                              {ticket.id && (
                                <PendingApplicationsBadge count={pendingApplicationsCounts[ticket.id] ?? 0} />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(ticket.id!)}
                          >
                            {(pendingApplicationsCounts[ticket.id!] ?? 0) > 0 ? 'Review Applications' : 'View Details'}
                          </Button>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <DeveloperApplicationsPanel
                            applications={developerApplications[ticket.id || ''] || []}
                            ticketId={ticket.id!}
                            clientId={userId!}
                            isLoading={isLoadingApplications && !developerApplications[ticket.id || '']}
                            onApplicationUpdate={() => {
                              fetchTickets();
                            }}
                            onOpenChat={(developerId, developerName) => 
                              handleOpenChat(ticket.id!, developerId, developerName)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No active help requests.</p>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={expandedSections.pendingApproval} 
              onOpenChange={() => toggleSection('pendingApproval')}
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Pending Developer Approval</h2>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {pendingApprovalTickets?.length || 0}
                  </Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {expandedSections.pendingApproval ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="p-4">
                {pendingApprovalTickets && pendingApprovalTickets.length > 0 ? (
                  <div className="space-y-6">
                    {pendingApprovalTickets.map(ticket => (
                      <div key={ticket.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-white p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-medium">{ticket.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(ticket.id!)}
                            >
                              {(pendingApplicationsCounts[ticket.id!] ?? 0) > 0 ? 'Review Applications' : 'View Details'}
                            </Button>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <DeveloperApplicationsPanel
                              applications={developerApplications[ticket.id || ''] || []}
                              ticketId={ticket.id!}
                              clientId={userId!}
                              isLoading={isLoadingApplications && !developerApplications[ticket.id || '']}
                              onApplicationUpdate={() => {
                                fetchTickets();
                              }}
                              onOpenChat={(developerId, developerName) => 
                                handleOpenChat(ticket.id!, developerId, developerName)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No help requests waiting for developer approval.</p>
                )}
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={expandedSections.inProgress} 
              onOpenChange={() => toggleSection('inProgress')}
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">In Progress Help Requests</h2>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {inProgressTickets?.length || 0}
                  </Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {expandedSections.inProgress ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="p-4">
                {createTicketPreview(inProgressTickets, 'in-progress')}
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={expandedSections.completed} 
              onOpenChange={() => toggleSection('completed')}
              className="border rounded-lg overflow-hidden"
            >
              <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Completed Help Requests</h2>
                  <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                    {completedTickets?.length || 0}
                  </Badge>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {expandedSections.completed ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="p-4">
                {createTicketPreview(completedTickets, 'completed')}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate('/get-help')}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Create New Help Request
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ClientDashboard;
