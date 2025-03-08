
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const LoginPrompt: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-800">Want to claim a ticket?</h3>
          <p className="text-sm text-blue-700">Sign in as a developer to claim and work on tickets</p>
        </div>
        <Button 
          onClick={() => navigate('/login', { state: { returnTo: '/developer-dashboard' } })}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Button>
      </div>
    </div>
  );
};

export default LoginPrompt;
