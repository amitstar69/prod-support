
import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onNextStep?: (e?: React.FormEvent) => void | Promise<void>;
  onBackStep?: () => void;
  nextDisabled?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  currentStep?: number;
  totalSteps?: number;
  goToStep?: (step: number) => void;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle = "",
  onNextStep = () => {},
  onBackStep,
  nextDisabled = false,
  showSkip = false,
  onSkip,
  nextLabel = 'Next',
  backLabel = 'Back',
  currentStep,
  totalSteps,
  goToStep
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        
        {currentStep && totalSteps && (
          <div className="mt-4 flex justify-center items-center">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-16 mx-1 rounded-full ${
                  index + 1 === currentStep 
                    ? 'bg-primary' 
                    : index + 1 < currentStep 
                      ? 'bg-primary/60' 
                      : 'bg-muted'
                }`}
                onClick={() => goToStep && index + 1 <= currentStep && goToStep(index + 1)}
                style={{ cursor: goToStep && index + 1 <= currentStep ? 'pointer' : 'default' }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {children}
          
          <div className="mt-8 flex justify-between">
            {onBackStep ? (
              <Button 
                onClick={onBackStep} 
                variant="outline"
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            ) : (
              <div></div>
            )}
            
            <div className="flex gap-4">
              {showSkip && onSkip && (
                <Button
                  onClick={onSkip}
                  variant="ghost"
                >
                  Skip
                </Button>
              )}
              
              <Button 
                onClick={(e) => onNextStep(e)} 
                disabled={nextDisabled}
                className="flex items-center gap-1"
              >
                {nextLabel}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
