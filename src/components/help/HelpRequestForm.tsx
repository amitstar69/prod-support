
import React from 'react';
import { HelpRequestProvider } from '../../contexts/HelpRequestContext';

// Import form components
import FormContainer from './form/FormContainer';
import Step1BasicInfo from './form/Step1BasicInfo';
import Step2AdditionalInfo from './form/Step2AdditionalInfo';

const HelpRequestFormContent: React.FC = () => {
  return (
    <FormContainer>
      <Step1BasicInfo />
      <Step2AdditionalInfo />
    </FormContainer>
  );
};

const HelpRequestForm: React.FC = () => {
  return (
    <HelpRequestProvider>
      <HelpRequestFormContent />
    </HelpRequestProvider>
  );
};

export default HelpRequestForm;
