
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowUpRight, Info } from 'lucide-react';

const LoginPrompt: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-md">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-blue-800 text-sm mb-1">You're viewing sample data</h3>
          <p className="text-sm text-blue-700 mb-3">
            Sign in to see real requests and start using the full platform features
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/login', { state: { returnTo: '/developer-dashboard' } })}
              className="bg-blue-600 hover:bg-blue-700 gap-1"
              size="sm"
            >
              Sign In <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button 
              onClick={() => navigate('/register', { state: { returnTo: '/developer-dashboard', userType: 'developer' } })}
              className="bg-transparent text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200"
              variant="outline"
              size="sm"
            >
              Register as Developer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
