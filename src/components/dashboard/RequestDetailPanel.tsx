
import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '../ui/badge';
import { HelpRequest } from '../../types/helpRequest';
import DeveloperApplications from './DeveloperApplications';

interface RequestDetailPanelProps {
  selectedRequest: HelpRequest | null;
  selectedRequestApplications: any[];
  onBack: () => void;
  onApplicationUpdate: () => void;
  onOpenChat: (developerId: string, applicationId: string) => void;
  userId: string;
  selectedRequestId: string;
}

const RequestDetailPanel: React.FC<RequestDetailPanelProps> = ({
  selectedRequest,
  selectedRequestApplications,
  onBack,
  onApplicationUpdate,
  onOpenChat,
  userId,
  selectedRequestId,
}) => {
  return (
    <div>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all requests
        </Button>
        
        {selectedRequest && (
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedRequest.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
              </div>
              <Badge 
                variant="outline"
                className={`
                  ${selectedRequest.status === 'in-progress' ? 'bg-green-50 text-green-800 border-green-200' : 
                   selectedRequest.status === 'matching' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                   selectedRequest.status === 'scheduled' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                   'bg-yellow-50 text-yellow-800 border-yellow-200'}
                `}
              >
                {selectedRequest.status}
              </Badge>
            </div>
            
            <div className="flex gap-2 mb-4">
              {selectedRequest.technical_area.map((area, i) => (
                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <h3 className="text-lg font-semibold mb-2">
          Developer Applications
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Review and respond to developers who have applied to help with your request
        </p>
        
        <DeveloperApplications 
          applications={selectedRequestApplications}
          requestId={selectedRequestId}
          clientId={userId || ''}
          onApplicationUpdate={onApplicationUpdate}
          onOpenChat={onOpenChat}
        />
      </div>
    </div>
  );
};

export default RequestDetailPanel;
