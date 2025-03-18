
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData, updateUserData } from '../../../../contexts/auth';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { toast } from 'sonner';

const DeveloperBasicInfoStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();
  const { userId } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    phone: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: userData.email || '',
            location: userData.location || '',
            phone: userData.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);
  
  useEffect(() => {
    // Check if required fields are filled
    setFormValid(
      formData.firstName.trim() !== '' && 
      formData.lastName.trim() !== '' && 
      formData.email.trim() !== ''
    );
  }, [formData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUserData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        location: formData.location,
        phone: formData.phone,
        username: `${formData.firstName.toLowerCase()}${formData.lastName.toLowerCase()}`
      };
      
      const success = await updateUserData(updatedUserData);
      
      if (success) {
        toast.success('Basic information saved successfully');
        goToNextStep();
      } else {
        toast.error('Failed to save information');
      }
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <OnboardingLayout
      title="Let's start with the basics"
      subtitle="We need some basic information to set up your profile"
      onNextStep={handleSubmit}
      nextDisabled={!formValid || isLoading}
      showBackButton={false}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="City, Country"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Your phone number"
          />
        </div>
        
        <p className="text-sm text-muted-foreground">
          * Required fields
        </p>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperBasicInfoStep;
