
import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { useClientTickets } from '../../features/tickets/client/hooks/useClientTickets';
import { Ticket } from '../../features/tickets/shared/types/ticket';
import { HelpRequest } from '../../types/helpRequest';
import { setupHelpRequestsSubscription } from '../../integrations/supabase/realtime';

// Components
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ClientTicketList from './ClientTicketList';
import ClientTicketBoard from './ClientTicketBoard';
import LoadingState from './LoadingState';
import { Badge } from '../ui/badge';
import { 
  PlusCircle, 
  Search,
  List, 
  LayoutGrid, 
  Filter, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Helper function to convert Ticket to HelpRequest
const convertTicketToHelpRequest = (ticket: Ticket): HelpRequest => {
  // Map Ticket fields to HelpRequest fields
  return {
    id: ticket.id,
    client_id: ticket.clientId,
    title: ticket.title,
    description: ticket.description,
    technical_area: ticket.tags || [],
    urgency: ticket.priority,
    communication_preference: [],
    estimated_duration: ticket.estimatedHours ? Math.floor(ticket.estimatedHours * 60) : 30,
    budget_range: ticket.budget ? `$${ticket.budget}` : 'Under $50',
    status: ticket.status.replace('_', '-'), // Convert status format if needed
    created_at: ticket.createdAt.toISOString(),
    updated_at: ticket.updatedAt.toISOString(),
  };
};

const ClientTicketDashboard: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Get tickets using the existing hook
  const { 
    tickets, 
    isLoading, 
    error, 
    refreshTickets 
  } = useClientTickets(userId || '');
  
  // Convert Ticket[] to HelpRequest[]
  const helpRequestTickets: HelpRequest[] = tickets.map(convertTicketToHelpRequest);
  
  // Filter tickets based on search and status
  const filteredTickets = helpRequestTickets.filter((ticket) => {
    const matchesSearch = searchQuery.trim() === '' || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = selectedStatus === null || ticket.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = setupHelpRequestsSubscription((payload) => {
      // When there's an update to help_requests table, refresh the tickets
      if (payload.table === 'help_requests' && 
          (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT')) {
        refreshTickets();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [userId, refreshTickets]);
  
  // Determine ticket counts by status
  const openCount = filteredTickets.filter(t => ['open', 'pending', 'matching'].includes(t.status || '')).length;
  const inProgressCount = filteredTickets.filter(t => ['claimed', 'in-progress', 'developer-qa'].includes(t.status || '')).length;
  const reviewCount = filteredTickets.filter(t => ['client-review', 'client-approved'].includes(t.status || '')).length;
  const completedCount = filteredTickets.filter(t => ['completed', 'resolved'].includes(t.status || '')).length;

  const createNewTicket = () => {
    navigate('/get-help');
  };
  
  if (isLoading) {
    return <LoadingState text="Loading your tickets..." />;
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-center">
        <p className="text-red-800">Error loading tickets: {error}</p>
        <Button 
          onClick={refreshTickets} 
          variant="outline" 
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with stats */}
      <div className="flex flex-col gap-4 sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground">
            Track and manage your help requests
          </p>
        </div>
        
        <Button 
          onClick={createNewTicket} 
          className="shrink-0 gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          New Ticket
        </Button>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow-sm border rounded-lg p-4">
          <div className="text-muted-foreground text-sm font-medium">Open</div>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold">{openCount}</span>
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              Awaiting Help
            </Badge>
          </div>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-4">
          <div className="text-muted-foreground text-sm font-medium">In Progress</div>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold">{inProgressCount}</span>
            <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
              Being Worked On
            </Badge>
          </div>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-4">
          <div className="text-muted-foreground text-sm font-medium">Review</div>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold">{reviewCount}</span>
            <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
              Needs Your Input
            </Badge>
          </div>
        </div>
        
        <div className="bg-white shadow-sm border rounded-lg p-4">
          <div className="text-muted-foreground text-sm font-medium">Completed</div>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-bold">{completedCount}</span>
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              Resolved
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tickets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className={viewMode === 'board' ? 'bg-muted' : ''}
            onClick={() => setViewMode('board')}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Board view</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className={viewMode === 'list' ? 'bg-muted' : ''}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={refreshTickets}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Status filter tabs */}
      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value)}>
        <TabsList className="grid grid-cols-5 md:w-auto w-full">
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">{filteredTickets.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="open">
            Open
            <Badge variant="secondary" className="ml-2">{openCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress
            <Badge variant="secondary" className="ml-2">{inProgressCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="client-review">
            Review
            <Badge variant="secondary" className="ml-2">{reviewCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="secondary" className="ml-2">{completedCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Ticket content based on view mode */}
      {viewMode === 'board' ? (
        <ClientTicketBoard tickets={filteredTickets} />
      ) : (
        <ClientTicketList tickets={filteredTickets} />
      )}
      
      {filteredTickets.length === 0 && (
        <div className="bg-white border border-dashed rounded-lg p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tickets found</h3>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            {searchQuery || selectedStatus
              ? "Try adjusting your search or filters to find what you're looking for."
              : "You haven't created any help requests yet. Click 'New Ticket' to get started."}
          </p>
          {!(searchQuery || selectedStatus) && (
            <Button onClick={createNewTicket} className="mt-4">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Ticket
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientTicketDashboard;
