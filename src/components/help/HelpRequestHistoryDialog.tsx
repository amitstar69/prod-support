
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Clock, Check, AlertCircle, FileEdit, PauseCircle } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { HelpRequestHistoryItem } from '../../types/helpRequest';

interface HelpRequestHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
}

const HelpRequestHistoryDialog: React.FC<HelpRequestHistoryDialogProps> = ({
  isOpen,
  onClose,
  requestId,
  requestTitle
}) => {
  const [historyItems, setHistoryItems] = useState<HelpRequestHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestHistory();
    }
  }, [isOpen, requestId]);

  const fetchRequestHistory = async () => {
    if (!requestId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('help_request_history')
        .select('*')
        .eq('help_request_id', requestId)
        .order('changed_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching request history:', error);
        toast.error('Failed to load request history');
        return;
      }
      
      setHistoryItems(data as HelpRequestHistoryItem[]);
    } catch (error) {
      console.error('Exception fetching request history:', error);
      toast.error('An unexpected error occurred while loading history');
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeIcon = (changeType: string, newStatus: string | null) => {
    if (changeType === 'STATUS_CHANGE') {
      switch (newStatus) {
        case 'completed':
          return <Check className="h-5 w-5 text-green-500" />;
        case 'cancelled':
          return <AlertCircle className="h-5 w-5 text-red-500" />;
        case 'in-progress':
          return <PauseCircle className="h-5 w-5 text-blue-500" />;
        default:
          return <Clock className="h-5 w-5 text-gray-500" />;
      }
    } else if (changeType === 'EDIT') {
      return <FileEdit className="h-5 w-5 text-orange-500" />;
    } else if (changeType === 'CANCELLED') {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  const formatChangeMessage = (item: HelpRequestHistoryItem) => {
    if (item.change_type === 'STATUS_CHANGE') {
      return `Status changed from ${item.previous_status || 'unknown'} to ${item.new_status || 'unknown'}`;
    } else if (item.change_type === 'EDIT') {
      const changes = [];
      
      if (item.change_details.title_changed) {
        changes.push('title');
      }
      
      if (item.change_details.description_changed) {
        changes.push('description');
      }
      
      if (item.change_details.technical_area_changed) {
        changes.push('technical areas');
      }
      
      if (item.change_details.budget_changed) {
        changes.push('budget');
      }
      
      return `Request updated: ${changes.join(', ')} changed`;
    } else if (item.change_type === 'CANCELLED') {
      return `Request cancelled: ${item.change_details.cancellation_reason || 'No reason provided'}`;
    }
    
    return 'Unknown change';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request History</DialogTitle>
          <DialogDescription>
            View the change history for "{requestTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : historyItems.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-6">
                {historyItems.map((item) => (
                  <div key={item.id} className="relative pl-10">
                    <div className="absolute left-0 p-2 rounded-full bg-white">
                      {getChangeIcon(item.change_type, item.new_status)}
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-sm font-medium">{formatChangeMessage(item)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(item.changed_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No history available for this request</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpRequestHistoryDialog;
