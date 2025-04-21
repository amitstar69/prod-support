
import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const PublicHelpRequests: React.FC = () => {
  // Example help request data
  const helpRequests = [
    {
      id: '1',
      title: 'React useEffect causing infinite loop',
      description: 'I have a useEffect hook that seems to be causing an infinite loop. I\'m not sure how to fix it.',
      status: 'open',
      technicalArea: ['React', 'JavaScript'],
      urgency: 'medium',
      createdAt: '2025-04-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Database query performance issue',
      description: 'My PostgreSQL query is taking too long to execute. Need help optimizing it.',
      status: 'open',
      technicalArea: ['SQL', 'PostgreSQL'],
      urgency: 'high',
      createdAt: '2025-04-16T14:20:00Z',
    },
    {
      id: '3',
      title: 'Docker container not starting',
      description: 'My Docker container fails to start with error code 137. I\'ve tried increasing memory but it still fails.',
      status: 'assigned',
      technicalArea: ['Docker', 'DevOps'],
      urgency: 'critical',
      createdAt: '2025-04-17T09:15:00Z',
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Public Help Requests</h1>
          <a 
            href="/help-request"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Submit New Request
          </a>
        </div>
        
        <div className="grid gap-6">
          {helpRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="text-lg font-medium">
                    <a href={`/ticket/${request.id}`} className="hover:text-primary hover:underline">
                      {request.title}
                    </a>
                  </CardTitle>
                  <Badge 
                    variant="outline"
                    className={getUrgencyColor(request.urgency)}
                  >
                    {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  #{request.id} • Created on {formatDate(request.createdAt)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 line-clamp-2">{request.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {request.technicalArea.map((area, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">{area}</Badge>
                    ))}
                  </div>
                  <Badge 
                    variant={request.status === 'open' ? 'default' : 'secondary'}
                  >
                    {request.status === 'open' ? 'Open for applications' : 'Developer assigned'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PublicHelpRequests;
