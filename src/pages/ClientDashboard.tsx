import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TicketSection from '../components/dashboard/TicketSection';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/auth';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import { Plus, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { HelpRequestMatch } from '../types/helpRequest';

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
  
  const {
    categorizedTickets,
    isLoading,
    showFilters,
    setShowFilters,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets
  } = useDeveloperDashboard();

  // Safely get categories
  const activeTickets = categorizedTickets?.activeTickets || [];
  const inProgressTickets = categorizedTickets?.inProgressTickets || [];
  const completedTickets = categorizedTickets?.completedTickets || [];
  const pendingApprovalTickets = categorizedTickets?.pendingApprovalTickets || [];

  // Toggle section expansion
  const toggleSection = (section: 'active' | 'pendingApproval' | 'inProgress' | 'completed') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch developer applications for pending approval tickets
  useEffect(() => {
    const fetchApplications = async () => {
      if (!pendingApprovalTickets?.length || !isAuthenticated) return;
      
      try {
        setIsLoadingApplications(true);
        const ticketIds = pendingApprovalTickets.map(ticket => ticket.id);
        
        // Create a map to store applications by ticket ID
        const applicationsByTicket: Record<string, HelpRequestMatch[]> = {};
        
        // Fetch applications for each ticket
        for (const ticketId of ticketIds) {
          if (!ticketId) continue;
          
          const { data, error } = await supabase
            .from('help_request_matches')
            .select(`
              *,
              profiles:developer_id (id, name, image, experience)
            `)
            .eq('request_id', ticketId);
            
          if (error) {
            console.error('Error fetching developer applications:', error);
            continue;
          }
          
          if (data && data.length > 0) {
            // Process the data to ensure it matches our type
            const typedApplications: HelpRequestMatch[] = data.map(app => {
              // Handle potentially malformed profiles data
              let safeProfiles = app.profiles;
              
              if (!safeProfiles || typeof safeProfiles !== 'object') {
                safeProfiles = { 
                  id: app.developer_id, 
                  name: 'Unknown Developer',
                  image: null,
                  experience: null
                };
              } else if ('error' in safeProfiles) {
                // If it's an error object, replace with safe default data
                safeProfiles = { 
                  id: app.developer_id, 
                  name: 'Unknown Developer',
                  image: null,
                  experience: null
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

  // Real-time updates for applications
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    
    // Subscribe to changes in help request matches
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
          fetchTickets(false); // Don't show loading state for realtime updates
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, userId, fetchTickets]);

  const handleOpenChat = (helpRequestId: string, developerId: string, developerName?: string) => {
    console.log('Opening chat for request:', helpRequestId, 'with developer:', developerId);
    // Navigate to chat page or open chat dialog
    navigate(`/chat/${helpRequestId}?with=${developerId}&name=${developerName || 'Developer'}`);
  };
  
  const handleApproveApplication = async (applicationId: string, ticketId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'approved' })
        .eq('id', applicationId);
      
      if (error) {
        toast.error('Failed to approve application: ' + error.message);
        return;
      }
      
      // Update help request status to 'approved'
      const { error: ticketError } = await supabase
        .from('help_requests')
        .update({ status: 'approved' })
        .eq('id', ticketId);
      
      if (ticketError) {
        toast.error('Failed to update ticket status: ' + ticketError.message);
        return;
      }
      
      toast.success('Developer application approved!');
      fetchTickets();
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'rejected' })
        .eq('id', applicationId);
      
      if (error) {
        toast.error('Failed to reject application: ' + error.message);
        return;
      }
      
      toast.success('Developer application rejected');
      fetchTickets();
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('An unexpected error occurred');
    }
  };

  // Function to create preview of tickets (first 3)
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
  
  return (
    <Layout>
      <DashboardBanner />
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={showFilters} 
          setShowFilters={setShowFilters}
          onRefresh={fetchTickets}
          title="My Help Requests"
          description="Track and manage your help requests"
        />

        <div className="space-y-6">
          {/* Active Help Requests Section */}
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
              {createTicketPreview(activeTickets, 'active')}
            </CollapsibleContent>
          </Collapsible>
          
          {/* Pending Developer Approval Section */}
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
                            onClick={() => navigate(`/client/tickets/${ticket.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                        
                        {/* Developer Applications */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">Developer Applications</h4>
                            <Badge variant="outline" className="text-xs">
                              {developerApplications[ticket.id || '']?.length || 0} Applications
                            </Badge>
                          </div>
                          
                          {!developerApplications[ticket.id || ''] || developerApplications[ticket.id || ''].length === 0 ? (
                            <p className="text-sm text-muted-foreground">No applications yet</p>
                          ) : (
                            <div className="space-y-3">
                              {developerApplications[ticket.id || ''].map(application => (
                                <div key={application.id} className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                      <img 
                                        src={application.profiles?.image || '/placeholder.svg'} 
                                        alt={application.profiles?.name || 'Developer'}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium">{application.profiles?.name || 'Anonymous Developer'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Experience: {application.profiles?.experience || 'Not specified'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleOpenChat(ticket.id!, application.developer_id, application.profiles?.name)}
                                    >
                                      Chat
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      onClick={() => handleRejectApplication(application.id!)}
                                    >
                                      Reject
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleApproveApplication(application.id!, ticket.id!)}
                                    >
                                      Accept
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
          
          {/* In Progress Help Requests Section */}
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
          
          {/* Completed Help Requests Section */}
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
