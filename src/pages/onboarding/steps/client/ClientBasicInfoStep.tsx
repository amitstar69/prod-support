
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { updateUserData } from '../../../../contexts/auth';
import { Client } from '../../../../types/product';

const ClientBasicInfoStep: React.FC = () => {
  const { userData, updateUserDataAndProceed } = useOnboarding();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: userData?.name ? userData.name.split(' ')[0] : '',
    lastName: userData?.name ? userData.name.split(' ').slice(1).join(' ') : '',
    email: userData?.email || '',
    company: 'company' in userData ? userData.company || '' : '',
    position: 'position' in userData ? userData.position || '' : '',
    location: userData?.location || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      // Type guard to ensure we're dealing with a Client
      const clientData: Partial<Client> = {
        name: fullName,
        email: formData.email,
        company: formData.company,
        position: formData.position,
        location: formData.location,
        profileCompletionPercentage: 25, // 25% complete after basic info
      };
      
      await updateUserDataAndProceed(clientData);
    } catch (error) {
      console.error('Error updating basic info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Basic Information</h1>
      <p className="text-muted-foreground mb-8">
        Let's get started with some basic information about you.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-1">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1">
            Company (Optional)
          </label>
          <input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="position" className="block text-sm font-medium mb-1">
            Position (Optional)
          </label>
          <input
            id="position"
            name="position"
            type="text"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="City, Country"
            required
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientBasicInfoStep;
