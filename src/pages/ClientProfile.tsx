
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { useAuth, getCurrentUserData, updateUserData } from '../contexts/AuthContext';
import { Client } from '../types/product';
import ProfileCard from '../components/profile/ProfileCard';

const ClientProfile: React.FC = () => {
  const { userId } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          setClient(userData as Client);
          
          // Split the name into first and last name for the form
          const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setFormData({
            firstName,
            lastName,
            email: userData.email || '',
            location: userData.location || '',
            description: userData.description || ''
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    try {
      const updatedData: Partial<Client> = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        location: formData.location,
        description: formData.description
      };
      
      console.log("Submitting client profile update:", updatedData);
      
      const success = await updateUserData(updatedData);
      
      if (success) {
        // Refresh client data
        const userData = await getCurrentUserData();
        if (userData) {
          setClient(userData as Client);
        }
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </Layout>
    );
  }
  
  if (!client) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="heading-3 mb-4">Profile not found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find your profile information</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Client Profile</h1>
          <p className="text-center text-muted-foreground">Manage your profile information</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <ProfileCard 
          client={client}
          formData={formData}
          onInputChange={handleInputChange}
          isSaving={isSaving}
          onSave={handleSaveChanges}
        />
      </div>
    </Layout>
  );
};

export default ClientProfile;
