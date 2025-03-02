
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, MapPin, Calendar, Clock, ExternalLink, Eye, Edit3, Plus, Target, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, getCurrentUserData, updateUserData } from '../contexts/AuthContext';
import { Client } from '../types/product';

const ClientProfile: React.FC = () => {
  const { userId, userType } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    location: '',
    description: '',
    preferredWorkingHours: '',
    languages: ['English'],
    lookingFor: [''] 
  });
  
  useEffect(() => {
    const fetchUser = () => {
      setIsLoading(true);
      const userData = getCurrentUserData() as Client;
      if (userData) {
        setClient(userData);
        setEditFormData({
          name: userData.name || '',
          username: userData.username || '',
          location: userData.location || '',
          description: userData.description || '',
          preferredWorkingHours: userData.preferredWorkingHours || '',
          languages: userData.languages || ['English'],
          lookingFor: userData.lookingFor || ['']
        });
      }
      setIsLoading(false);
    };
    
    fetchUser();
  }, [userId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const success = updateUserData({
        ...editFormData,
        profileCompletionPercentage: calculateCompletionPercentage(editFormData)
      });
      
      if (success) {
        // Refresh client data
        const userData = getCurrentUserData() as Client;
        setClient(userData);
        setIsEditing(false);
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
  
  const calculateCompletionPercentage = (data: typeof editFormData) => {
    let fields = 0;
    let completed = 0;
    
    // Count filled fields
    if (data.name) completed++;
    if (data.username) completed++;
    if (data.location) completed++;
    if (data.description) completed++;
    if (data.preferredWorkingHours) completed++;
    if (data.languages && data.languages.length > 0) completed++;
    if (data.lookingFor && data.lookingFor.length > 0 && data.lookingFor[0] !== '') completed++;
    
    fields = 7; // Total number of fields we're tracking
    
    return Math.round((completed / fields) * 100);
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
          <h1 className="heading-2 mb-2 text-center">My Client Profile</h1>
          <p className="text-center text-muted-foreground">Manage your profile and preferences</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Column - Profile Card */}
          <div>
            <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-amber-600 flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">
                    {client.name ? client.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                
                <h2 className="text-xl font-medium mb-1">{client.name || 'Your Name'}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  @{client.username || 'username'}
                </p>
                
                <div className="w-full space-y-4 mt-2">
                  {client.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{client.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Joined {new Date(client.joinedDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  
                  {client.preferredWorkingHours && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Preferred: {client.preferredWorkingHours}</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-6 w-full py-2 px-4 border border-border rounded-md flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                
                <button className="mt-3 w-full py-2 px-4 border border-border rounded-md flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>Preview Public Profile</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Main Content */}
          <div>
            {/* Profile Completion Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-blue-600">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-800 mb-1">This is your profile when ordering services</h3>
                <p className="text-sm text-blue-700">
                  For your developer profile click <a href="/profile" className="underline font-medium">here</a>.
                </p>
              </div>
              <button className="ml-auto text-sm font-medium text-blue-600">
                Dismiss
              </button>
            </div>
            
            {isEditing ? (
              /* Edit Profile Form */
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
                <form onSubmit={handleSaveProfile}>
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Edit Your Profile</h2>
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-sm text-muted-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Full Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium mb-1">
                            Username
                          </label>
                          <input
                            id="username"
                            name="username"
                            type="text"
                            value={editFormData.username}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-1">
                          Location
                        </label>
                        <input
                          id="location"
                          name="location"
                          type="text"
                          value={editFormData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. New York, USA"
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                          About You
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          value={editFormData.description}
                          onChange={handleInputChange}
                          placeholder="Share a bit about yourself and how you plan to work with developers"
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="preferredWorkingHours" className="block text-sm font-medium mb-1">
                          Preferred Working Hours
                        </label>
                        <input
                          id="preferredWorkingHours"
                          name="preferredWorkingHours"
                          type="text"
                          value={editFormData.preferredWorkingHours}
                          onChange={handleInputChange}
                          placeholder="e.g. 9 AM - 5 PM EST"
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="lookingFor" className="block text-sm font-medium mb-1">
                          Looking For (separate with commas)
                        </label>
                        <input
                          id="lookingFor"
                          name="lookingFor"
                          type="text"
                          value={editFormData.lookingFor.join(', ')}
                          onChange={(e) => {
                            const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                            setEditFormData(prev => ({ ...prev, lookingFor: skills }));
                          }}
                          placeholder="e.g. React, Node.js, Mobile Development"
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-border/40 p-6 md:p-8 flex justify-end">
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
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Profile View */
              <>
                <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden mb-8">
                  <div className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-4">Profile Checklist</h2>
                    
                    <div className="mb-4">
                      <div className="w-full bg-secondary/50 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${client.profileCompletionPercentage || 33}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-muted-foreground">{client.profileCompletionPercentage || 33}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 border border-border rounded-lg flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <Target className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">Share how you plan to use our platform</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Tell us if you're here to find services or offer them.
                          </p>
                          
                          {client.description ? (
                            <div className="text-sm p-3 bg-secondary/30 rounded-md">
                              {client.description}
                            </div>
                          ) : (
                            <button 
                              onClick={() => setIsEditing(true)}
                              className="text-sm text-primary font-medium flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </button>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-sm font-medium">
                            {client.description ? '100%' : '0%'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 border border-border rounded-lg flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">Set your communication preferences</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Let developers know your collaboration preferences.
                          </p>
                          
                          {client.preferredWorkingHours ? (
                            <div className="text-sm p-3 bg-secondary/30 rounded-md">
                              Preferred hours: {client.preferredWorkingHours}
                            </div>
                          ) : (
                            <button 
                              onClick={() => setIsEditing(true)}
                              className="text-sm text-primary font-medium flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </button>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-sm font-medium">
                            {client.preferredWorkingHours ? '50%' : '0%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h2 className="text-xl font-semibold mb-6">Reviews from Developers</h2>
                    
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-16 w-24 mb-4">
                        <svg viewBox="0 0 128 85" className="text-muted-foreground/30">
                          <path d="M46 85c13 0 20-8 20-22 0-16-11-25-25-25v13c5 0 8 3 8 9-9 0-15 7-15 16 0 6 5 9 12 9zm56 0c13 0 20-8 20-22 0-16-11-25-25-25v13c5 0 8 3 8 9-9 0-15 7-15 16 0 6 5 9 12 9z" fill="currentColor" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground mb-1">You don't have any reviews yet.</p>
                      <p className="text-sm text-muted-foreground">
                        Reviews will appear here after you've worked with developers.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClientProfile;
