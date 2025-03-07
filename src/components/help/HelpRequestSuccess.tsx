
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Clock, User } from 'lucide-react';

const HelpRequestSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestId = location.state?.requestId;

  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-8 w-8 text-green-600" />
      </div>
      
      <h1 className="heading-2 mb-4">Help Request Submitted!</h1>
      
      <p className="text-muted-foreground max-w-lg mx-auto mb-8">
        Your request has been received and we're matching you with qualified developers.
        You'll be notified when developers are available to help you.
      </p>
      
      {requestId && (
        <div className="bg-secondary/50 p-4 rounded-md mb-8 inline-block">
          <span className="text-sm font-medium">Request ID: </span>
          <code className="text-sm bg-background px-1 py-0.5 rounded">{requestId}</code>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
        <div className="bg-white p-6 rounded-xl border border-border/40 shadow-sm text-left">
          <Clock className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-lg font-medium mb-2">What happens next?</h3>
          <p className="text-muted-foreground text-sm">
            Our system will match you with qualified developers based on your requirements.
            You'll receive notifications when developers are available to assist you.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-border/40 shadow-sm text-left">
          <User className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-lg font-medium mb-2">Developer matching</h3>
          <p className="text-muted-foreground text-sm">
            You'll be able to choose from matched developers or let our system automatically
            connect you with the best available expert for your issue.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/get-help')}
          className="px-6 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors"
        >
          Submit Another Request
        </button>
        
        <button
          onClick={() => navigate('/session-history')}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          View Your Requests
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default HelpRequestSuccess;
