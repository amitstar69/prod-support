
import React from 'react';
import { Info } from 'lucide-react';
import { useAuth } from '../../../contexts/auth';
import { Link } from 'react-router-dom';

/**
 * Component that displays a warning message for non-authenticated users
 */
const AuthWarning: React.FC = () => {
  return (
    <div className="mt-3 p-3 border border-yellow-200 bg-yellow-50 rounded-md flex items-start gap-2">
      <Info className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-700">
        You're using a temporary account. Your request will be stored locally on this device only. 
        To save to the database and access from any device, please{' '}
        <Link to="/register" className="font-medium underline">create an account</Link> or{' '}
        <Link to="/login" className="font-medium underline">log in</Link>.
      </p>
    </div>
  );
};

export default AuthWarning;
