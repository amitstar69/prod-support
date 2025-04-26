
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/auth';
import ChatInterface from '../components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { userId } = useAuth();
  
  if (!ticketId || !userId) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Missing ticket information or user not authenticated.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chat Session</CardTitle>
        </CardHeader>
        <CardContent className="h-[70vh]">
          <ChatInterface 
            helpRequestId={ticketId} 
            otherId="temp-id" // This would need to be fetched from the ticket data
            otherName="Developer" 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;
