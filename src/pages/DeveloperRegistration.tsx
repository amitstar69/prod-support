import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { useAuth, getCurrentUserData, updateUserData } from '../contexts/auth';

const DeveloperRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated or already a developer with completed profile
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      
      if (userType === 'developer') {
        const userData = await getCurrentUserData();
        // Check if developer has a completed profile
        if (userData && 'category' in userData && userData.category) {
          navigate('/profile');
        }
      }
    };
    
    checkUserStatus();
  }, [isAuthenticated, userType, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Extract form values
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const category = formData.get('category') as string;
      const skills = formData.get('skills') as string;
      const experience = formData.get('experience') as string;
      const description = formData.get('description') as string;
      const hourlyRate = parseFloat(formData.get('hourlyRate') as string);
      const minuteRate = parseFloat(formData.get('minuteRate') as string);
      const availability = formData.has('availability');
      
      // Get selected communication methods
      const communicationMethods: string[] = [];
      if (form.querySelector<HTMLInputElement>('input[name="communication[]"][value="video"]:checked')) {
        communicationMethods.push('video');
      }
      if (form.querySelector<HTMLInputElement>('input[name="communication[]"][value="audio"]:checked')) {
        communicationMethods.push('audio');
      }
      if (form.querySelector<HTMLInputElement>('input[name="communication[]"][value="chat"]:checked')) {
        communicationMethods.push('chat');
      }
      
      // Create developer object
      const developerData = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        category,
        skills: skills.split(',').map(skill => skill.trim()),
        experience,
        description,
        hourlyRate,
        minuteRate,
        availability,
        communicationPreferences: communicationMethods,
        profileCompleted: true
      };
      
      // Update the user profile
      const success = await updateUserData(developerData);
      
      if (success) {
        toast.success('Profile saved successfully!');
        navigate('/profile');
      } else {
        toast.error('Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Join as a Developer</h1>
          <p className="text-center text-muted-foreground">Offer your expertise and earn by helping others</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">Your Professional Profile</h2>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                        First Name*
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                        Last Name*
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email*
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone Number*
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Professional Details */}
                <div className="pt-4 border-t border-border/30">
                  <h3 className="text-lg font-medium mb-4">Professional Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-1">
                        Specialization*
                      </label>
                      <select
                        id="category"
                        name="category"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      >
                        <option value="">Select your primary expertise</option>
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
                        Skills (comma separated)*
                      </label>
                      <input
                        id="skills"
                        type="text"
                        placeholder="React, TypeScript, Node.js, etc."
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium mb-1">
                        Experience Summary*
                      </label>
                      <input
                        id="experience"
                        type="text"
                        placeholder="5+ years in full-stack development"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Professional Bio*
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        placeholder="Describe your expertise and what kind of help you can provide to clients"
                        className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Pricing and Availability */}
                <div className="pt-4 border-t border-border/30">
                  <h3 className="text-lg font-medium mb-4">Pricing and Availability</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
                          Hourly Rate (USD)*
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            id="hourlyRate"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="85"
                            className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="minuteRate" className="block text-sm font-medium mb-1">
                          Per-Minute Rate (USD)*
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            id="minuteRate"
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="1.5"
                            className="w-full pl-8 pr-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="availability"
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                        />
                        <span className="text-sm font-medium">I am available for immediate support requests</span>
                      </label>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Communication Preferences</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                            name="communication[]"
                            value="video"
                          />
                          <span>Video Call</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                            name="communication[]"
                            value="audio"
                          />
                          <span>Audio Call</span>
                        </label>
                        <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                            name="communication[]"
                            value="chat"
                          />
                          <span>Text Chat</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Terms & Conditions */}
                <div className="pt-4 border-t border-border/30">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          required
                          className="h-4 w-4 mt-1 rounded border-border text-primary focus:ring-primary/25"
                        />
                        <span className="text-sm">
                          I agree to the <a href="#" className="text-primary font-medium">Terms of Service</a> and <a href="#" className="text-primary font-medium">Privacy Policy</a>. I understand that I will be subject to a verification process before my profile is published.
                        </span>
                      </label>
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="button-primary w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          "Submit Application"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperRegistration;
