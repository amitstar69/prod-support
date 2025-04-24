
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const RegistrationPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>
        
        {/* Registration form would go here */}
        <div className="bg-white p-6 shadow-sm rounded-lg">
          <p className="text-center mb-4">Registration form placeholder</p>
          
          <div className="mt-6">
            <Button className="w-full">Register</Button>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
