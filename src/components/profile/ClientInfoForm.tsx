
import React from 'react';

interface ClientInfoFormProps {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({ 
  firstName, 
  lastName, 
  email, 
  location 
}) => {
  return (
    <div className="flex-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={firstName}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={lastName}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
          required
        />
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={location}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
        />
      </div>
    </div>
  );
};

export default ClientInfoForm;
