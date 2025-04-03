
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpRequest, HelpRequestMatch } from '../../types/helpRequest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Bell, Clock, FileEdit, AlertCircle } from 'lucide-react';
import { Progress } from '../ui/progress';

interface ActiveRequestsGridProps {
  requests: HelpRequest[];
  requestMatches: Record<string, HelpRequestMatch[]>;
  isLoading: boolean;
  onViewRequest: (requestId: string) => void;
  onEditRequest: (request: HelpRequest) => void;
  onViewHistory: (request: HelpRequest) => void;
  onCancelRequest: (request: HelpRequest) => void;
  getApplicationCountForRequest: (requestId: string) => number;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusDescription: (status: string) => string;
}

const ActiveRequestsGrid: React.FC<ActiveRequestsGridProps> = ({
  requests,
  requestMatches,
  isLoading,
  onViewRequest,
  onEditRequest,
  onViewHistory,
  onCancelRequest,
  getApplicationCountForRequest,
  getStatusIcon,
  getStatusDescription,
}) => {
  if (isLoading) {
    return null; // Loading state is handled in the parent component
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
        <h3 className="text-xl font-medium mb-2">No active help requests</h3>
        <p className="text-muted-foreground mb-4">
          You don't have any active help requests at the moment.
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
        <Card 
          key={request.id} 
          className={`overflow-hidden hover:shadow-md transition-shadow ${
            getApplicationCountForRequest(request.id!) > 0 ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardHeader className="pb-2 space-y-1">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base truncate flex items-center">
                {request.title}
                {getApplicationCountForRequest(request.id!) > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary text-white">
                    {getApplicationCountForRequest(request.id!)}
                  </Badge>
                )}
              </CardTitle>
              <Badge 
                variant="outline"
                className={`
                  ${request.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                    request.status === 'matching' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    request.status === 'scheduled' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                    'bg-yellow-50 text-yellow-800 border-yellow-200'}
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
              {request.technical_area.length > 3 && (
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
                  +{request.technical_area.length - 3}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {getStatusIcon(request.status || 'pending')}
                <span>{getStatusDescription(request.status || 'pending')}</span>
              </div>
              
              {request.status === 'matching' && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Developer applications</span>
                    <span className="font-medium">
                      {requestMatches[request.id!]?.length || 0}
                    </span>
                  </div>
                  <Progress value={
                    requestMatches[request.id!]?.length 
                      ? Math.min(requestMatches[request.id!].length * 20, 100) 
                      : 5
                  } className="h-1.5" />
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full"
              variant={getApplicationCountForRequest(request.id!) > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => onViewRequest(request.id!)}
            >
              {getApplicationCountForRequest(request.id!) > 0 ? (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  View Applications ({getApplicationCountForRequest(request.id!)})
                </>
              ) : (
                "View Details"
              )}
            </Button>
            
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEditRequest(request)}
              >
                <FileEdit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewHistory(request)}
              >
                <Clock className="h-3.5 w-3.5 mr-1" />
                History
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-500 hover:text-red-700"
                onClick={() => onCancelRequest(request)}
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ActiveRequestsGrid;
