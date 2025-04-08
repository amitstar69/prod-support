
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/auth';

interface ProfileCompletionBannerProps {
  completionPercentage: number;
  userType: 'developer' | 'client';
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ 
  completionPercentage, 
  userType 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated || completionPercentage >= 80) {
    return null;
  }
  
  const handleCompleteProfile = () => {
    if (userType === 'developer') {
      navigate('/onboarding/developer');
    } else {
      navigate('/onboarding/client');
    }
  };
  
  // Use different colors based on completion percentage
  const getBgColor = () => {
    if (completionPercentage < 30) return 'bg-red-50 border-red-200';
    if (completionPercentage < 60) return 'bg-amber-50 border-amber-200';
    return 'bg-amber-50 border-amber-200';
  };
  
  const getProgressColor = () => {
    if (completionPercentage < 30) return 'bg-red-200';
    if (completionPercentage < 60) return 'bg-amber-200';
    return 'bg-amber-200';
  };
  
  const getTextColor = () => {
    if (completionPercentage < 30) return 'text-red-800';
    if (completionPercentage < 60) return 'text-amber-800';
    return 'text-amber-800';
  };
  
  const getButtonClass = () => {
    if (completionPercentage < 30) return 'bg-red-100 border-red-300 hover:bg-red-200 text-red-800';
    if (completionPercentage < 60) return 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800';
    return 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800';
  };
  
  return (
    <div className={`${getBgColor()} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <AlertCircle className={`h-5 w-5 ${completionPercentage < 30 ? 'text-red-500' : 'text-amber-500'}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${getTextColor()} mb-1`}>
            Your profile is incomplete
          </h3>
          <p className={`text-sm ${getTextColor()} mb-3`}>
            {userType === 'developer'
              ? 'Complete your profile to increase your chances of getting hired'
              : 'Complete your profile to better match with developers'}
          </p>
          
          <div className="mb-3">
            <div className={`flex justify-between text-xs ${getTextColor()} mb-1`}>
              <span>Profile completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className={`h-2 ${getProgressColor()}`} 
            />
          </div>
          
          <Button
            variant="outline"
            className={getButtonClass()}
            onClick={handleCompleteProfile}
          >
            Complete Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
