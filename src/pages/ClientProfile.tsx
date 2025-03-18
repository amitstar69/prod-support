
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import ProfileCard from '../components/profile/ProfileCard';
import ProfileLoadingState from '../components/profile/ProfileLoadingState';
import ProfileErrorState from '../components/profile/ProfileErrorState';
import { useClientProfile } from '../hooks/useClientProfile';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb';

const ClientProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { 
    client,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges
  } = useClientProfile();
  
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
        <ProfileLoadingState onForceLogout={handleForceLogout} />
      </Layout>
    );
  }
  
  if (loadingTimeoutReached) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Loading Timeout"
          message="We couldn't load your profile information in a reasonable time. This could be due to connection issues or server problems."
          onRetry={() => window.location.reload()}
          onForceLogout={handleForceLogout}
        />
      </Layout>
    );
  }
  
  if (!client) {
    return (
      <Layout>
        <ProfileErrorState 
          title="Profile not found"
          message="We couldn't find your profile information"
          onRetry={() => window.location.reload()}
          onForceLogout={handleForceLogout}
        />
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
