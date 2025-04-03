
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth } from '../../../../contexts/auth';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Separator } from '../../../../components/ui/separator';
import { CheckCircle2, Edit, User, Building, Briefcase, MapPin, Code, DollarSign } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { toast } from 'sonner';

interface ReviewAndSubmitStepProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReviewAndSubmitStep: React.FC<ReviewAndSubmitStepProps> = ({ isLoading, setIsLoading }) => {
  const { state, completeOnboarding, goToStep } = useOnboarding();
  const { authState } = useAuth();
  const [profileData, setProfileData] = useState<any>({});

  // Combine all step data
  useEffect(() => {
    const combinedData = {
      ...state.stepData[1],
      ...state.stepData[2],
      ...state.stepData[3]
    };
    setProfileData(combinedData);
  }, [state.stepData]);

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('There was a problem completing your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review Your Profile</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Please review your information before completing your profile setup
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex justify-between items-center">
              <span className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => goToStep(1)}
                className="h-8 px-2"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start">
              <span className="font-medium w-1/3">Name:</span>
              <span className="w-2/3">{profileData.name || 'Not provided'}</span>
            </div>
            {profileData.company && (
              <div className="flex items-start">
                <span className="font-medium w-1/3">Company:</span>
                <span className="w-2/3 flex items-center">
                  <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                  {profileData.company}
                </span>
              </div>
            )}
            {profileData.position && (
              <div className="flex items-start">
                <span className="font-medium w-1/3">Position:</span>
                <span className="w-2/3 flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                  {profileData.position}
                </span>
              </div>
            )}
            {profileData.location && (
              <div className="flex items-start">
                <span className="font-medium w-1/3">Location:</span>
                <span className="w-2/3 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  {profileData.location}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex justify-between items-center">
              <span className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Project Information
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => goToStep(2)}
                className="h-8 px-2"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="font-medium">Project Description:</span>
              <p className="text-sm">{profileData.description || 'Not provided'}</p>
            </div>
            
            <div className="space-y-2">
              <span className="font-medium">Technical Areas of Interest:</span>
              {profileData.techInterests && profileData.techInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {profileData.techInterests.map((tech: string) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No technologies specified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex justify-between items-center">
              <span className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Budget Preferences
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => goToStep(3)}
                className="h-8 px-2"
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.budgetPreference === 'hourly' ? (
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Hourly Budget:</span> ${profileData.budgetPerHour || '0'}/hour
                </p>
                {profileData.budgetPerHour && (
                  <p className="text-sm text-muted-foreground">
                    Per-minute rate: ${(Number(profileData.budgetPerHour) / 60).toFixed(2)}/minute
                  </p>
                )}
              </div>
            ) : profileData.budgetPreference === 'project' ? (
              <p>
                <span className="font-medium">Project Budget:</span> ${profileData.customBudget || '0'}
              </p>
            ) : (
              <p className="text-muted-foreground">No budget preference specified</p>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleCompleteOnboarding}
            disabled={isLoading}
            className="w-full max-w-md"
            size="lg"
          >
            {isLoading ? 'Completing Profile...' : (
              <span className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Complete Profile Setup
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndSubmitStep;
