import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, getCurrentUserData, updateUserData } from '../contexts/AuthContext';
import { Client } from '../types/product';

const ClientProfile: React.FC = () => {
  const { userId } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          setClient(userData as Client);
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
  
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const updatedData: Partial<Client> = {
      name: formData.get('firstName') + ' ' + formData.get('lastName'),
      email: formData.get('email') as string,
      location: formData.get('location') as string,
      description: formData.get('description') as string
    };
    
    try {
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
  
  // Split the name into first and last name
  const nameParts = client.name ? client.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Client Profile</h1>
          <p className="text-center text-muted-foreground">Manage your profile information</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSaveChanges}>
            <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Client Information</h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="relative">
                      <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                    <button type="button" className="text-sm text-primary font-medium">
                      Change Image
                    </button>
                  </div>
                  
                  {/* Form */}
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
                        defaultValue={client?.email || ''}
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
                        defaultValue={client?.location || ''}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border/40 p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">About You</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Brief Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      defaultValue={client?.description || ''}
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border/40 p-6 md:p-8">
                <button 
                  type="submit"
                  className="button-primary inline-flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ClientProfile;
