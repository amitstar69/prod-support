
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ListChecks, Send } from 'lucide-react';

const HelpRequestSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestId } = location.state || {};

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-border/40 text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Help Request Submitted Successfully!</h2>
      
      <p className="text-muted-foreground mb-6">
        Your request has been received and our system is now looking for the best developers to match with your needs.
        You'll receive updates as your request progresses.
      </p>
      
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/get-help/tracking')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <ListChecks className="h-5 w-5" />
          View Your Requests
        </button>
        
        <button
          onClick={() => navigate('/get-help')}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary bg-white rounded-md hover:bg-primary/5 transition-colors"
        >
          <Send className="h-5 w-5" />
          Submit Another Request
        </button>
      </div>
    </div>
  );
};

export default HelpRequestSuccess;
