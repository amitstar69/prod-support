
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { HelpRequest } from '../../types/helpRequest';

interface TicketDetailsPanelProps {
  ticket: HelpRequest;
}

const TicketDetailsPanel: React.FC<TicketDetailsPanelProps> = ({ ticket }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description || "No description provided."}</p>
        </div>
        
        {ticket.technical_area && ticket.technical_area.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Technical Areas</h4>
            <div className="flex flex-wrap gap-2">
              {ticket.technical_area.map((area: string) => (
                <Badge key={area} variant="secondary">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {ticket.communication_preference && ticket.communication_preference.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Communication Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {ticket.communication_preference.map((pref: string) => (
                <Badge key={pref} variant="outline">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {ticket.urgency && (
          <div>
            <h4 className="text-sm font-medium mb-1">Urgency</h4>
            <Badge 
              variant="outline" 
              className={
                ticket.urgency === 'high' ? 'text-red-600 border-red-200 bg-red-50' :
                ticket.urgency === 'medium' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                'text-blue-600 border-blue-200 bg-blue-50'
              }
            >
              {ticket.urgency.charAt(0).toUpperCase() + ticket.urgency.slice(1)} Priority
            </Badge>
          </div>
        )}
        
        {ticket.budget_range && (
          <div>
            <h4 className="text-sm font-medium mb-1">Budget Range</h4>
            <p className="text-muted-foreground">{ticket.budget_range}</p>
          </div>
        )}
        
        {ticket.estimated_duration && (
          <div>
            <h4 className="text-sm font-medium mb-1">Estimated Duration</h4>
            <p className="text-muted-foreground">{ticket.estimated_duration} minutes</p>
          </div>
        )}
        
        {ticket.code_snippet && (
          <div>
            <h4 className="text-sm font-medium mb-1">Code Snippet</h4>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {ticket.code_snippet}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketDetailsPanel;
