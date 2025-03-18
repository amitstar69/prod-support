
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Developer } from '../../../../types/product';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';

const DeveloperBasicInfoStep: React.FC = () => {
  const { userData, updateUserDataAndProceed } = useOnboarding();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      const fullName = userData.name || '';
      const nameParts = fullName.split(' ');
      
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userData.email || '',
        phone: 'phone' in userData ? userData.phone || '' : '',
        location: userData.location || '',
        bio: 'bio' in userData ? userData.bio || '' : '',
      });
    }
  }, [userData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const developerData: Partial<Developer> = {
        name: fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        profileCompletionPercentage: 25, // 25% complete after basic info
      };
      
      await updateUserDataAndProceed(developerData);
    } catch (error) {
      console.error('Error updating basic info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <OnboardingLayout 
      title="Basic Information"
      subtitle="Let's get started with some basic information about you"
      onNextStep={handleSubmit}
      nextDisabled={isSubmitting}
    >
      <div className="space-y-6">
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
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="+1 (123) 456-7890"
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
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Short Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Tell us a bit about yourself"
            rows={3}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperBasicInfoStep;
