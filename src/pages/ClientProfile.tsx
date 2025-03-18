import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { useAuth, getCurrentUserData, updateUserData } from '../contexts/auth';
import { Client } from '../types/product';
import ProfileCard from '../components/profile/ProfileCard';
import { LogOut, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const ClientProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userId, logout } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    description: '',
    username: '',
    bio: '',
    company: '',
    position: '',
    techStack: [] as string[],
    industry: '',
    projectTypes: [] as string[],
    preferredHelpFormat: [] as string[],
    budgetPerHour: 0,
    paymentMethod: 'Stripe' as 'Stripe' | 'PayPal'
  });
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      
      const timeoutId = setTimeout(() => {
        console.log('Profile loading timeout reached');
        setLoadingTimeoutReached(true);
        setIsLoading(false);
        toast.error("Loading profile data is taking longer than expected. You can try logging out and back in.");
      }, 10000);
      
      try {
        const userData = await getCurrentUserData();
        
        clearTimeout(timeoutId);
        
        if (userData) {
          const clientData = userData as Client;
          setClient(clientData);
          
          const nameParts = clientData.name ? clientData.name.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setFormData({
            firstName,
            lastName,
            email: clientData.email || '',
            location: clientData.location || '',
            description: clientData.description || '',
            username: clientData.username || '',
            bio: clientData.bio || '',
            company: clientData.company || '',
            position: clientData.position || '',
            techStack: clientData.techStack || [],
            industry: clientData.industry || '',
            projectTypes: clientData.projectTypes || [],
            preferredHelpFormat: (clientData.preferredHelpFormat || []) as string[],
            budgetPerHour: clientData.budgetPerHour || 0,
            paymentMethod: (clientData.paymentMethod || 'Stripe') as 'Stripe' | 'PayPal'
          });
        } else {
          toast.error("Failed to load profile data: User data not found");
          console.error("User data not found");
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    } else {
      setIsLoading(false);
      toast.error("User ID not found. Please try logging in again.");
    }
    
    return () => {
      setIsLoading(false);
    };
  }, [userId]);
  
  const handleInputChange = (field: string, value: any) => {
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
        description: formData.description,
        username: formData.username,
        bio: formData.bio,
        company: formData.company,
        position: formData.position,
        techStack: formData.techStack,
        industry: formData.industry,
        projectTypes: formData.projectTypes,
        preferredHelpFormat: formData.preferredHelpFormat,
        budgetPerHour: formData.budgetPerHour,
        paymentMethod: formData.paymentMethod,
        profileCompleted: true,
        profileCompletionPercentage: 100
      };
      
      console.log("Submitting client profile update:", updatedData);
      
      const success = await updateUserData(updatedData);
      
      if (success) {
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
  
  const handleForceLogout = async () => {
    try {
      localStorage.removeItem('authState');
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during force logout:', error);
      window.location.href = '/';
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse text-xl mb-8">Loading profile...</div>
          
          <p className="text-muted-foreground mb-4">
            If this screen persists for more than a few seconds, you may want to log out and try again.
          </p>
          
          <Button 
            onClick={handleForceLogout} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            <span>Force Logout</span>
          </Button>
        </div>
      </Layout>
    );
  }
  
  if (loadingTimeoutReached) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="heading-3 mb-4">Loading Timeout</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't load your profile information in a reasonable time.
            This could be due to connection issues or server problems.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              className="w-48"
            >
              Try Again
            </Button>
            
            <Button 
              onClick={handleForceLogout}
              variant="outline"
              className="w-48 flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </Button>
          </div>
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
          
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              className="w-48"
            >
              Try Again
            </Button>
            
            <Button 
              onClick={handleForceLogout}
              variant="outline"
              className="w-48 flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-6">
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto text-muted-foreground" 
                      onClick={handleBack}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
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
