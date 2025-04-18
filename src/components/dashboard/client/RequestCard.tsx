
import React from 'react';
import { HelpRequest } from '../../../types/helpRequest';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Bell, FileEdit, Clock, AlertCircle } from 'lucide-react';
import { getStatusIcon, getStatusDescription } from './requestStatusUtils';

interface RequestCardProps {
  request: HelpRequest;
  applicationCount: number;
  hasNewApplications: boolean;
  onViewRequest: (requestId: string) => void;
  onEditRequest: (request: HelpRequest) => void;
  onViewHistory: (request: HelpRequest) => void;
  onCancelRequest: (request: HelpRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  applicationCount,
  hasNewApplications,
  onViewRequest,
  onEditRequest,
  onViewHistory,
  onCancelRequest
}) => {
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${
      hasNewApplications ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base truncate flex items-center">
            {request.title}
            {applicationCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary text-white">
                {applicationCount}
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
                <span className="font-medium">{applicationCount}</span>
              </div>
              <Progress value={applicationCount ? Math.min(applicationCount * 20, 100) : 5} className="h-1.5" />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full"
          variant={applicationCount > 0 ? "default" : "outline"}
          size="sm"
          onClick={() => onViewRequest(request.id!)}
        >
          {applicationCount > 0 ? (
            <>
              <Bell className="h-4 w-4 mr-2" />
              View Applications ({applicationCount})
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
  );
};

export default RequestCard;
