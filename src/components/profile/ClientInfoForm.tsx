
import React from 'react';

interface ClientInfoFormProps {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  onChange: (field: string, value: string) => void;
}

const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  firstName,
  lastName,
  email,
  location,
  onChange
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
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
            value={lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
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
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors bg-secondary/30"
          disabled
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Your email address is managed through your account settings
        </p>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          value={location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
          placeholder="City, Country"
        />
      </div>
    </div>
  );
};

export default ClientInfoForm;
