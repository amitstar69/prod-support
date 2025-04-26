
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';

const ClientTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('help_requests')
          .select('*')
          .eq('client_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTickets();
  }, [userId]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <Button onClick={() => navigate('/get-help')} className="gap-1">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-8">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any tickets yet.</p>
                  <Button onClick={() => navigate('/get-help')} className="mt-4">
                    Create a ticket
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>You have tickets! This view is under construction.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="active">
              <div className="text-center py-8">Active tickets view is under construction.</div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="text-center py-8">Completed tickets view is under construction.</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTicketsPage;
