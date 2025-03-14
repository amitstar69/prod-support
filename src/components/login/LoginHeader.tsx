
import React from 'react';

const LoginHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-secondary/30 to-secondary/60 py-12 border-b border-border/10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-3">Welcome Back</h1>
        <p className="text-center text-muted-foreground max-w-md mx-auto">
          Access your account to find expert developers or provide your services
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;
