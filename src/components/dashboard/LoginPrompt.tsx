
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowUpRight } from 'lucide-react';

const LoginPrompt: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-center justify-between">
      <div>
        <h3 className="font-medium text-blue-800 text-sm">Want to claim a ticket?</h3>
        <p className="text-xs text-blue-700">Sign in as a developer to work on help requests</p>
      </div>
      <Button 
        onClick={() => navigate('/login', { state: { returnTo: '/developer-dashboard' } })}
        className="bg-blue-600 hover:bg-blue-700 gap-1"
        size="sm"
      >
        Sign In <ArrowUpRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default LoginPrompt;
