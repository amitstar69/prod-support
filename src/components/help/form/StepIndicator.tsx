
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';

interface StepIndicatorProps {
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps }) => {
  const { currentStep } = useHelpRequest();
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep > index + 1 
                    ? 'bg-primary border-primary text-white' 
                    : currentStep === index + 1
                      ? 'border-primary text-primary'
                      : 'border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > index + 1 ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-sm ${
                currentStep === index + 1 ? 'text-primary font-medium' : 'text-gray-500'
              }`}>
                {index === 0 ? 'Basic Info' : 'Additional Details'}
              </span>
            </div>
            
            {/* Connector Line (except after last step) */}
            {index < totalSteps - 1 && (
              <div 
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep > index + 1 ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
