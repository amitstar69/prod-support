
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData } from '../../contexts/auth';
import DeveloperBasicInfoStep from './steps/developer/DeveloperBasicInfoStep';
import DeveloperSkillsStep from './steps/developer/DeveloperSkillsStep';
import DeveloperRatesStep from './steps/developer/DeveloperRatesStep';
import DeveloperAvailabilityStep from './steps/developer/DeveloperAvailabilityStep';
import DeveloperCompletionStep from './steps/developer/DeveloperCompletionStep';
import ProfileLoadingState from '../../components/profile/ProfileLoadingState';

const DeveloperOnboarding: React.FC = () => {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  useEffect(() => {
    const checkProfileStatus = async () => {
      setIsLoading(true);
      try {
        const userData = await getCurrentUserData();
        
        if (!userData) {
          // No user data found, possibly not logged in
          navigate('/login');
          return;
        }
        
        if (userData.profileCompleted) {
          // Profile already completed, redirect to dashboard
          navigate('/developer-dashboard');
          return;
        }
        
        // Determine starting step based on any existing profile data
        if (userData.name && userData.email) {
          // Use type guards to check for developer-specific properties
          if ('skills' in userData && userData.skills && userData.skills.length > 0) {
            if ('hourlyRate' in userData && 'minuteRate' in userData && userData.hourlyRate && userData.minuteRate) {
              if (userData.availability !== undefined) {
                setCurrentStep(5); // Almost complete, go to final step
              } else {
                setCurrentStep(4); // Has rates, go to availability step
              }
            } else {
              setCurrentStep(3); // Has skills, go to rates step
            }
          } else {
            setCurrentStep(2); // Has basic info, go to skills step
          }
        } else {
          setCurrentStep(1); // Start from beginning
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      checkProfileStatus();
    } else {
      navigate('/login');
    }
  }, [userId, navigate]);
  
  if (isLoading) {
    return <ProfileLoadingState onForceLogout={logout} />;
  }
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <DeveloperBasicInfoStep />;
      case 2:
        return <DeveloperSkillsStep />;
      case 3:
        return <DeveloperRatesStep />;
      case 4:
        return <DeveloperAvailabilityStep />;
      case 5:
        return <DeveloperCompletionStep />;
      default:
        return <DeveloperBasicInfoStep />;
    }
  };
  
  return (
    <OnboardingProvider userType="developer" totalSteps={5}>
      {renderCurrentStep()}
    </OnboardingProvider>
  );
};

export default DeveloperOnboarding;
