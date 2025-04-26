
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';

const MyApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('help_request_applications')
          .select(`
            *,
            help_request:help_request_id (*)
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

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">My Applications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-8">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't applied to any help requests yet.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>You have applications! This view is under construction.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="pending">
              <div className="text-center py-8">Pending applications view is under construction.</div>
            </TabsContent>
            <TabsContent value="approved">
              <div className="text-center py-8">Approved applications view is under construction.</div>
            </TabsContent>
            <TabsContent value="rejected">
              <div className="text-center py-8">Rejected applications view is under construction.</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyApplicationsPage;
