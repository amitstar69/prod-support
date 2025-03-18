
import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  nextDisabled?: boolean;
  showBackButton?: boolean;
  showSkipButton?: boolean;
  isLastStep?: boolean;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  nextDisabled = false,
  showBackButton = true,
  showSkipButton = true,
  isLastStep = false
}) => {
  const { 
    currentStep, 
    totalSteps, 
    goToNextStep, 
    goToPreviousStep, 
    completeOnboarding,
    skipOnboarding,
    isLoading
  } = useOnboarding();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Complete Your Profile</h1>
              <p className="text-muted-foreground text-sm">Step {currentStep} of {totalSteps}</p>
            </div>
            {showSkipButton && (
              <Button 
                variant="ghost" 
                onClick={skipOnboarding}
                disabled={isLoading}
              >
                Skip for now
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-muted border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            
            <div className="bg-card rounded-xl border border-border/40 shadow-sm p-6">
              {children}
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <div>
                {showBackButton && currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>
                )}
              </div>
              <div>
                {isLastStep ? (
                  <Button
                    variant="default"
                    onClick={completeOnboarding}
                    disabled={nextDisabled || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? 'Saving...' : 'Complete'}
                    <Check size={16} />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={goToNextStep}
                    disabled={nextDisabled || isLoading}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
