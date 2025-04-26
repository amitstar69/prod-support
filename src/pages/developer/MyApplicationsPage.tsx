
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  developer_id: string;
  created_at: string;
  help_request: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    technical_area: string[];
    urgency: string;
  };
}

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Use help_request_matches table instead of help_request_applications
        const { data, error } = await supabase
          .from('help_request_matches')
          .select(`
            *,
            help_request:request_id (
              id,
              title,
              status,
              created_at,
              technical_area,
              urgency
            )
          `)
          .eq('developer_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
  }, [userId]);

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    let className = '';
    
    switch (status) {
      case 'pending':
        className = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        break;
      case 'approved':
        className = 'bg-green-100 text-green-800 hover:bg-green-200';
        break;
      case 'rejected':
        className = 'bg-red-100 text-red-800 hover:bg-red-200';
        break;
      default:
        className = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
    
    return (
      <Badge variant="outline" className={className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleOpenTicket = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-8">Loading applications...</div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {activeTab === 'all' 
                      ? "You haven't applied to any help requests yet." 
                      : `No ${activeTab} applications found.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {filteredApplications.map((app) => (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">
                              {app.help_request?.title || "Untitled Request"}
                            </h3>
                            <div className="flex gap-2 mt-1 items-center">
                              <span className="text-xs text-muted-foreground">
                                Applied {format(new Date(app.created_at), 'MMM d, yyyy')}
                              </span>
                              {getStatusBadge(app.status)}
                            </div>
                            {app.help_request?.technical_area && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {app.help_request.technical_area.slice(0, 3).map((tech, i) => (
                                  <Badge key={i} variant="outline" className="bg-blue-50">
                                    {tech}
                                  </Badge>
                                ))}
                                {app.help_request.technical_area.length > 3 && (
                                  <Badge variant="outline">
                                    +{app.help_request.technical_area.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="gap-1"
                            onClick={() => app.help_request && handleOpenTicket(app.help_request.id)}
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        {app.help_request?.urgency && (
                          <div className="mt-3 flex items-center">
                            <span className="text-sm mr-2">Urgency:</span>
                            <Badge 
                              variant="outline" 
                              className={
                                app.help_request.urgency === 'high' ? 'bg-red-50 text-red-800' : 
                                app.help_request.urgency === 'medium' ? 'bg-yellow-50 text-yellow-800' : 
                                'bg-green-50 text-green-800'
                              }
                            >
                              {app.help_request.urgency.charAt(0).toUpperCase() + app.help_request.urgency.slice(1)}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApplicationsPage;
