
import { useState, useEffect } from 'react';
import { Client } from '../../types/product';

export interface ClientProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  description: string;
  username: string;
  bio: string;
  company: string;
  position: string;
  techStack: string[];
  industry: string;
  projectTypes: string[];
  preferredHelpFormat: string[];
  budgetPerHour: number;
  paymentMethod: 'Stripe' | 'PayPal';
  image?: string;
}

export const useClientProfileForm = (client: Client | null) => {
  const [formData, setFormData] = useState<ClientProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    description: '',
    username: '',
    bio: '',
    company: '',
    position: '',
    techStack: [],
    industry: '',
    projectTypes: [],
    preferredHelpFormat: [],
    budgetPerHour: 0,
    paymentMethod: 'Stripe',
    image: ''
  });

  // Update form data when client data changes
  useEffect(() => {
    if (client) {
      const nameParts = client.name ? client.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        firstName,
        lastName,
        email: client.email || '',
        location: client.location || '',
        description: client.description || '',
        username: client.username || '',
        bio: client.bio || '',
        company: client.company || '',
        position: client.position || '',
        techStack: client.techStack || [],
        industry: client.industry || '',
        projectTypes: client.projectTypes || [],
        preferredHelpFormat: (client.preferredHelpFormat || []) as string[],
        budgetPerHour: client.budgetPerHour || 0,
        paymentMethod: (client.paymentMethod || 'Stripe') as 'Stripe' | 'PayPal',
        image: client.image || ''
      });
    }
  }, [client]);

  const handleInputChange = (field: string, value: any) => {
    console.log('Input changed:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return { formData, handleInputChange };
};
