
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { User, CreditCard, LogOut, Settings, Video, MessageSquare, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, getCurrentUserData, updateUserData } from '../contexts/AuthContext';
import { Developer } from '../types/product';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          setDeveloper(userData as Developer);
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
    
    const updatedData: Partial<Developer> = {
      name: formData.get('firstName') + ' ' + formData.get('lastName'),
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      category: formData.get('category') as string,
      skills: (formData.get('skills') as string).split(',').map(skill => skill.trim()),
      experience: formData.get('experience') as string,
      hourlyRate: parseFloat(formData.get('hourlyRate') as string),
      availability: formData.has('availability'),
      description: formData.get('description') as string
    };
    
    try {
      const success = await updateUserData(updatedData);
      
      if (success) {
        // Refresh developer data
        const userData = await getCurrentUserData();
        if (userData) {
          setDeveloper(userData as Developer);
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
  
  const handleLogout = () => {
    logout();
    navigate('/');
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
  
  if (!developer) {
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
  const nameParts = developer.name ? developer.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Developer Profile</h1>
          <p className="text-center text-muted-foreground">Manage your profile, availability and preferences</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar */}
          <aside>
            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-4 py-2 rounded-md bg-primary/10 text-primary font-medium">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <Video className="h-5 w-5" />
                <span>Sessions</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <CreditCard className="h-5 w-5" />
                <span>Earnings</span>
              </button>
              
              <button className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded-md text-foreground/70 hover:bg-muted transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
          
          {/* Main Content */}
          <div>
            <form onSubmit={handleSaveChanges}>
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">Developer Information</h2>
                  
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
                          defaultValue={developer.email || ''}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          defaultValue={developer.phone || ''}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-1">
                          Specialization
                        </label>
                        <select
                          id="category"
                          name="category"
                          defaultValue={developer.category || 'frontend'}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        >
                          <option value="frontend">Frontend Development</option>
                          <option value="backend">Backend Development</option>
                          <option value="fullstack">Full Stack Development</option>
                          <option value="mobile">Mobile Development</option>
                          <option value="devops">DevOps</option>
                          <option value="database">Database</option>
                          <option value="security">Security</option>
                          <option value="ai">AI & Machine Learning</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="skills" className="block text-sm font-medium mb-1">
                          Skills (comma separated)
                        </label>
                        <input
                          id="skills"
                          name="skills"
                          type="text"
                          defaultValue={developer.skills ? developer.skills.join(', ') : ''}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium mb-1">
                          Experience Summary
                        </label>
                        <input
                          id="experience"
                          name="experience"
                          type="text"
                          defaultValue={developer.experience || ''}
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
                          Hourly Rate ($)
                        </label>
                        <input
                          id="hourlyRate"
                          name="hourlyRate"
                          type="number"
                          defaultValue={developer.hourlyRate || 75}
                          min="1"
                          step="1"
                          className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                          required
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          id="availability"
                          name="availability"
                          type="checkbox"
                          defaultChecked={developer.availability}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                        />
                        <label htmlFor="availability" className="text-sm font-medium">
                          Available for hire
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border/40 p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">About You</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Professional Summary (shown to potential clients)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={developer.description || ''}
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border/40 p-6 md:p-8">
                  <h2 className="text-xl font-semibold mb-6">Communication Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-medium mb-3">Preferred Communication Tools</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={true}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                            name="communication[]"
                            value="video"
                          />
                          <span>In-app Video Call</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={true}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                            name="communication[]"
                            value="teams"
                          />
                          <span>Microsoft Teams</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={true}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                            name="communication[]"
                            value="zoom"
                          />
                          <span>Zoom</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-2">
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
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
