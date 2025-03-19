
import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="Enter your first name"
            className="w-full transition-colors"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Enter your last name"
            className="w-full transition-colors"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="Your email address"
          className="w-full transition-colors"
          required
        />
        <p className="text-xs text-muted-foreground">
          Your email is used for account notifications and client communications.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="Your phone number"
          className="w-full transition-colors"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          type="text"
          value={location}
          onChange={(e) => onChange('location', e.target.value)}
          placeholder="City, Country"
          className="w-full transition-colors"
        />
        <p className="text-xs text-muted-foreground">
          Helps clients find developers in their timezone or region.
        </p>
      </div>
    </div>
  );
};

export default DeveloperInfoForm;
