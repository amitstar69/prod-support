
import React from 'react';
import { HelpRequestProvider } from '../../contexts/HelpRequestContext';

// Import form sections
import TitleDescriptionSection from './form/TitleDescriptionSection';
import TechnicalAreaSection from './form/TechnicalAreaSection';
import UrgencyDurationSection from './form/UrgencyDurationSection';
import CommunicationSection from './form/CommunicationSection';
import BudgetSection from './form/BudgetSection';
import CodeSnippetSection from './form/CodeSnippetSection';
import SubmitButton from './form/SubmitButton';
import FormContainer from './form/FormContainer';

const HelpRequestFormContent: React.FC = () => {
  return (
    <FormContainer>
      <TitleDescriptionSection />
      <TechnicalAreaSection />
      <UrgencyDurationSection />
      <CommunicationSection />
      <BudgetSection />
      <CodeSnippetSection />
      <SubmitButton />
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
