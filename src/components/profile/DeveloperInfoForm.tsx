
import React from 'react';

interface DeveloperInfoFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  onChange: (field: string, value: string) => void;
}

const DeveloperInfoForm: React.FC<DeveloperInfoFormProps> = ({ 
  firstName, 
  lastName, 
  email, 
  phone,
  location,
  onChange 
}) => {
  return (
    <div className="flex-1 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name
          </label>
          <input
            id="firstName"
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
            type="text"
            value={lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
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
          type="email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
          required
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-1">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
        />
      </div>
    </div>
  );
};

export default DeveloperInfoForm;
