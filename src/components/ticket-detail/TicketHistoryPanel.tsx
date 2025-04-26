
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

interface TicketHistoryPanelProps {
  ticketId: string;
  compact?: boolean;
  limit?: number;
}

const TicketHistoryPanel: React.FC<TicketHistoryPanelProps> = ({ 
  ticketId, 
  compact = false,
  limit = 10 
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('help_request_history')
          .select('*')
          .eq('help_request_id', ticketId)
          .order('changed_at', { ascending: false })
          .limit(limit);
          
        if (error) {
          console.error('Error fetching ticket history:', error);
          return;
        }
        
        setHistory(data || []);
      } catch (err) {
        console.error('Exception fetching ticket history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [ticketId, limit]);

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE': return 'Status Change';
      case 'EDIT': return 'Edited';
      case 'CANCELLED': return 'Cancelled';
      case 'DEVELOPER_QA': return 'Developer QA';
      case 'CLIENT_FEEDBACK': return 'Client Feedback';
      default: return type.replace(/_/g, ' ');
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-3/5" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, limit).map((item) => (
                <div key={item.id} className="text-sm">
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(item.changed_at), { addSuffix: true })}:
                  </span>{' '}
                  <span className="font-medium">{getChangeTypeLabel(item.change_type)}</span>
                  {item.change_type === 'STATUS_CHANGE' && (
                    <span>
                      {' '}from{' '}
                      <Badge variant="outline" className={getStatusBadgeColor(item.previous_status)}>
                        {item.previous_status?.replace(/_/g, ' ') || 'Unknown'}
                      </Badge>
                      {' '}to{' '}
                      <Badge variant="outline" className={getStatusBadgeColor(item.new_status)}>
                        {item.new_status?.replace(/_/g, ' ') || 'Unknown'}
                      </Badge>
                    </span>
                  )}
                </div>
              ))}
              {history.length > limit && (
                <p className="text-xs text-muted-foreground mt-2">
                  + {history.length - limit} more activities
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-muted-foreground">No history recorded for this ticket</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{getChangeTypeLabel(item.change_type)}</h4>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.changed_at).toLocaleString()}
                  </span>
                </div>
                
                {item.change_type === 'STATUS_CHANGE' && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className={getStatusBadgeColor(item.previous_status)}>
                      {item.previous_status?.replace(/_/g, ' ') || 'Unknown'}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="outline" className={getStatusBadgeColor(item.new_status)}>
                      {item.new_status?.replace(/_/g, ' ') || 'Unknown'}
                    </Badge>
                  </div>
                )}
                
                {item.change_type === 'EDIT' && item.change_details && (
                  <div className="mt-2 text-sm">
                    <p>Fields changed: {Object.entries(item.change_details)
                      .filter(([key, value]) => value === true)
                      .map(([key]) => key.replace('_changed', ''))
                      .join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketHistoryPanel;
