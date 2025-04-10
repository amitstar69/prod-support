
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import Layout from '../components/Layout';
import { getDeveloperById } from '../data/products';
import { Badge } from '../components/ui/badge';
import { Clock, MapPin, Calendar, Star, CheckCircle2, BadgeCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useDeveloperProfile } from '../hooks/useDeveloperProfile';
import DeveloperProfileCard from '../components/profile/DeveloperProfileCard';
import ProfileLoadingState from '../components/profile/ProfileLoadingState';
import ProfileErrorState from '../components/profile/ProfileErrorState';
import { useAuth, logoutUser } from '../contexts/auth';

const DeveloperProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();
  const location = useLocation();
  const isEditing = location.pathname.includes('/edit');
  const isOwnProfile = id === userId;
  
  const {
    developer,
    formData,
    isLoading,
    isSaving,
    loadingTimeoutReached,
    handleInputChange,
    handleSaveChanges,
    refreshProfile
  } = useDeveloperProfile();

  if (isLoading) {
    return <ProfileLoadingState onForceLogout={logoutUser} />;
  }
  
  if (loadingTimeoutReached) {
    return <ProfileErrorState 
      title="Profile Loading Timeout"  
      message="Profile data loading timeout. Please try again or log out and back in."
      onRetry={refreshProfile}
      onForceLogout={logoutUser}
    />;
  }
  
  if (!developer) {
    return <ProfileErrorState 
      title="Profile Not Found"
      message="Developer profile could not be found."
      onForceLogout={logoutUser}
    />;
  }

  if (isEditing && isOwnProfile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Edit Profile</h1>
              <Link to={`/developer/${id}`}>
                <Button variant="ghost">View Public Profile</Button>
              </Link>
            </div>
            
            <DeveloperProfileCard 
              developer={developer}
              formData={formData}
              onInputChange={handleInputChange}
              isSaving={isSaving}
              onSave={handleSaveChanges}
              refreshProfile={refreshProfile}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // Public profile view or own profile (non-edit mode)
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{isOwnProfile ? 'My Profile' : 'Developer Profile'}</h1>
            {isOwnProfile && (
              <Link to={`/developer/${id}/edit`}>
                <Button>Edit Profile</Button>
              </Link>
            )}
          </div>
          
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={developer.image || '/placeholder.svg'}
                    alt={developer.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                  />
                </div>
                
                <div className="flex flex-col gap-3 flex-grow">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-semibold">{developer.name}</h2>
                    {developer.premiumVerified && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {developer.featured && (
                      <Badge className="bg-amber-500 hover:bg-amber-600">Featured</Badge>
                    )}
                  </div>
                  
                  <div className="text-muted-foreground">{developer.description}</div>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {developer.location || 'Location not specified'}
                    </div>
                    
                    {developer.online && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600 dark:text-green-400">Online</span>
                      </div>
                    )}
                    
                    {!developer.online && developer.lastActive && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Last active {developer.lastActive}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {developer.experience}
                    </div>
                    
                    {developer.rating && (
                      <div className="flex items-center gap-1.5 text-sm text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500" />
                        {developer.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">{developer.bio || developer.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {developer.skills?.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Rates</h3>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="font-medium">${developer.hourlyRate || 0}</span>/hour
                    </div>
                    <div>
                      <span className="font-medium">${developer.minuteRate || 0}</span>/minute
                    </div>
                  </div>
                </div>
                
                {!isOwnProfile && (
                  <div className="pt-4">
                    <Button className="w-full md:w-auto">Request Help</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperProfilePage;
