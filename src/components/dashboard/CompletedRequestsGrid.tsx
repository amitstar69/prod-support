
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Star } from 'lucide-react';

interface CompletedRequestsGridProps {
  requests: HelpRequest[];
  isLoading: boolean;
  onViewRequest: (requestId: string) => void;
  onViewHistory: (request: HelpRequest) => void;
}

const CompletedRequestsGrid: React.FC<CompletedRequestsGridProps> = ({
  requests,
  isLoading,
  onViewRequest,
  onViewHistory,
}) => {
  if (isLoading) {
    return null; // Loading state is handled in the parent component
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
        <h3 className="text-xl font-medium mb-2">No completed help requests</h3>
        <p className="text-muted-foreground mb-4">
          You don't have any completed help requests yet.
        </p>
        <Button onClick={() => window.location.href = '/get-help'}>
          Create New Help Request
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((request) => (
        <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 space-y-1">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base truncate">{request.title}</CardTitle>
              <Badge 
                variant="outline"
                className={`
                  ${request.status === 'completed' ? 'bg-green-50 text-green-800 border-green-200' : 
                   'bg-red-50 text-red-800 border-red-200'}
                `}
              >
                {request.status}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 text-xs">{request.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-1 mb-3">
              {request.technical_area.slice(0, 3).map((area, i) => (
                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                  {area}
                </Badge>
              ))}
            </div>
            
            {request.status === 'completed' && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">Developer Rating</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-3.5 w-3.5 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full"
              variant="outline"
              size="sm"
              onClick={() => onViewRequest(request.id!)}
            >
              View Details
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => onViewHistory(request)}
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              View History
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CompletedRequestsGrid;
