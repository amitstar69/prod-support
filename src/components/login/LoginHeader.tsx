
import React from 'react';

const LoginHeader: React.FC = () => {
  return (
    <div className="bg-secondary/50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="heading-2 mb-2 text-center">Log In</h1>
        <p className="text-center text-muted-foreground">Access your account</p>
      </div>
    </div>
  );
};

export default LoginHeader;
