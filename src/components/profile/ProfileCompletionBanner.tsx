
import React from 'react';
import { Link } from 'react-router-dom';
import { User, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProfileCompletionBannerProps {
  profileCompletionPercentage: number;
  name?: string;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ 
  profileCompletionPercentage,
  name
}) => {
  // Determine banner appearance based on completion percentage
  const isProfileComplete = profileCompletionPercentage === 100;
  
  if (isProfileComplete) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 dark:bg-green-800 rounded-full p-2">
            <User className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
              Profile Complete
            </h3>
            <div className="mt-1 text-sm text-green-700 dark:text-green-400">
              Your profile is fully set up and ready to go!
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex items-center mb-3 sm:mb-0">
          <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-800 rounded-full p-2">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Complete Your Profile
            </h3>
            <div className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              {name ? `Hey ${name.split(' ')[0]}, please` : 'Please'} complete your profile to get the most out of our platform.
            </div>
          </div>
        </div>
        <div className="flex-1 sm:ml-6">
          <div className="flex items-center mb-1">
            <div className="flex-1 mr-4">
              <Progress value={profileCompletionPercentage} className="h-2" />
            </div>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300 whitespace-nowrap">
              {profileCompletionPercentage}%
            </span>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-3 sm:mt-0 sm:ml-4 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50">
          <Link to="/client-profile" className="flex items-center">
            Complete Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
