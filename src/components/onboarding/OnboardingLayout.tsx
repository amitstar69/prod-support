
import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onNextStep: (e?: React.FormEvent) => void | Promise<void>;
  onBackStep?: () => void;
  nextDisabled?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  onNextStep,
  onBackStep,
  nextDisabled = false,
  showSkip = false,
  onSkip,
  nextLabel = 'Next',
  backLabel = 'Back'
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
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
