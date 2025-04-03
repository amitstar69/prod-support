import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { invalidateUserDataCache } from '../contexts/auth/userDataFetching';
import { updateUserData } from '../contexts/auth/userDataUpdates';

const DeveloperRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    category: '',
    skills: [],
    hourlyRate: 0,
    experience: '',
    availability: false,
  });

  useEffect(() => {
    if (authState.userId) {
      invalidateUserDataCache(authState.userId);
    }
  }, [authState.userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      skills: value.split(',').map(skill => skill.trim()),
    }));
  };

  const invalidateCache = () => {
    if (authState.userId) {
      invalidateUserDataCache(authState.userId);
    }
  };

  const updateProfile = async (profile: any) => {
    try {
      setIsLoading(true);
      const success = await updateUserData(profile);
      if (success) {
        toast.success('Profile updated successfully');
        navigate('/developer-dashboard');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = {
      ...profileData,
      id: authState.userId,
    };
    await updateProfile(profile);
  };

  return (
    <div>
      <h1>Developer Registration</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={profileData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Fullstack</option>
          </select>
        </div>
        <div>
          <label htmlFor="skills">Skills (comma-separated):</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={profileData.skills.join(', ')}
            onChange={handleSkillsChange}
          />
        </div>
        <div>
          <label htmlFor="hourlyRate">Hourly Rate:</label>
          <input
            type="number"
            id="hourlyRate"
            name="hourlyRate"
            value={profileData.hourlyRate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="experience">Experience:</label>
          <select
            id="experience"
            name="experience"
            value={profileData.experience}
            onChange={handleChange}
          >
            <option value="">Select Experience</option>
            <option value="1+ years">1+ years</option>
            <option value="3+ years">3+ years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>
        <div>
          <label htmlFor="availability">Availability:</label>
          <input
            type="checkbox"
            id="availability"
            name="availability"
            checked={profileData.availability}
            onChange={() => setProfileData(prevData => ({
              ...prevData,
              availability: !prevData.availability,
            }))}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Update Profile'}
        </button>
      </form>
      <button onClick={invalidateCache}>Invalidate Cache</button>
    </div>
  );
};

export default DeveloperRegistration;
