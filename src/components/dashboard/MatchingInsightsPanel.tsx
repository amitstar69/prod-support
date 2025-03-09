import React from 'react';
import { useTicketMatching } from '../../hooks/useTicketMatching';
import { HelpRequest } from '../../types/helpRequest';
import { Developer } from '../../types/product';
import { TicketPriority } from '../../types/matching';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { RefreshCw, AlertTriangle, Lightbulb } from 'lucide-react';
import MatchingResults from '../matching/MatchingResults';

interface MatchingInsightsPanelProps {
  tickets: HelpRequest[];
  developers: Developer[];
  onRefresh?: () => void;
}

const MatchingInsightsPanel: React.FC<MatchingInsightsPanelProps> = ({ 
  tickets, 
  developers,
  onRefresh 
}) => {
  const { 
    isLoading, 
    error, 
    ticketsWithMatches, 
    refreshMatching 
  } = useTicketMatching(tickets, developers);
  
  // Count tickets by priority
  const ticketsByPriority = {
    [TicketPriority.CRITICAL]: 0,
    [TicketPriority.HIGH]: 0,
    [TicketPriority.MEDIUM]: 0,
    [TicketPriority.LOW]: 0
  };
  
  ticketsWithMatches.forEach(ticket => {
    ticketsByPriority[ticket.priorityLevel as TicketPriority]++;
  });
  
  // Get counts for insights
  const totalTickets = ticketsWithMatches.length;
  const ticketsWithGoodMatches = ticketsWithMatches.filter(
    t => t.matches.length > 0 && t.matches[0].matchScore >= 60
  ).length;
  
  const criticalTicketsWithoutMatch = ticketsWithMatches.filter(
    t => t.priorityLevel === TicketPriority.CRITICAL && 
    (t.matches.length === 0 || t.matches[0].matchScore < 60)
  ).length;
  
  const handleRefresh = () => {
    refreshMatching();
    if (onRefresh) {
      onRefresh();
    }
  };
  
  if (error) {
    return (
      <Card className="w-full mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Developer Matching</CardTitle>
          <CardDescription>Automatic ticket-developer matching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 rounded-md flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="text-sm">Error loading matching data: {error}</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // If there are no tickets or developers, show a different message
  if ((!tickets || tickets.length === 0) && (!ticketsWithMatches || ticketsWithMatches.length === 0)) {
    return (
      <Card className="w-full mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Developer Matching</CardTitle>
          <CardDescription>Automatic ticket-developer matching</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-md flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">No open tickets available for matching.</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Create a list of critical tickets that need attention
  const criticalTickets = ticketsWithMatches
    .filter(t => t.priorityLevel === TicketPriority.CRITICAL)
    .sort((a, b) => b.priorityScore - a.priorityScore);
  
  return (
    <div className="space-y-6 mb-6">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Developer Matching Insights</CardTitle>
              <CardDescription>Analyzing tickets and developer compatibility</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Analyzing ticket and developer data...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-2xl font-semibold">{totalTickets}</div>
                  <div className="text-xs text-muted-foreground">Total Open Tickets</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-2xl font-semibold">{ticketsWithGoodMatches}</div>
                  <div className="text-xs text-muted-foreground">With Good Matches</div>
                </div>
                <div className="bg-red-50 p-3 rounded-md">
                  <div className="text-2xl font-semibold text-red-700">{ticketsByPriority[TicketPriority.CRITICAL]}</div>
                  <div className="text-xs text-red-600">Critical Priority</div>
                </div>
                <div className="bg-orange-50 p-3 rounded-md">
                  <div className="text-2xl font-semibold text-orange-700">{ticketsByPriority[TicketPriority.HIGH]}</div>
                  <div className="text-xs text-orange-600">High Priority</div>
                </div>
              </div>
              
              {criticalTicketsWithoutMatch > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium text-sm text-red-800">Critical Tickets Needing Attention</h4>
                  </div>
                  <p className="text-xs text-red-700 mb-2">
                    {criticalTicketsWithoutMatch} critical {criticalTicketsWithoutMatch === 1 ? 'ticket has' : 'tickets have'} no suitable developer match.
                  </p>
                </div>
              )}
              
              {criticalTickets.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium mb-2">Critical Priority Tickets:</h3>
                  <MatchingResults 
                    results={criticalTickets}
                    showDeveloperDetails={false}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchingInsightsPanel;
