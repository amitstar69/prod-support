
import { ClientProfileFormData } from './useClientProfileForm';

export const calculateProfileCompletionPercentage = (formData: ClientProfileFormData): number => {
  const requiredFields: (keyof ClientProfileFormData)[] = [
    'firstName', 'lastName', 'email', 'username', 'location'
  ];
  
  const optionalFields: (keyof ClientProfileFormData)[] = [
    'bio', 'company', 'position', 'techStack', 'industry', 
    'description', 'projectTypes', 'preferredHelpFormat', 
    'budgetPerHour', 'paymentMethod'
  ];
  
  let completedRequiredFields = 0;
  for (const field of requiredFields) {
    const value = formData[field];
    if ((typeof value === 'string' && value.trim() !== '') || 
        (Array.isArray(value) && value.length > 0)) {
      completedRequiredFields++;
    }
  }
  
  let completedOptionalFields = 0;
  for (const field of optionalFields) {
    const value = formData[field];
    if ((typeof value === 'string' && value.trim() !== '') || 
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'number' && value > 0)) {
      completedOptionalFields++;
    }
  }
  
  const requiredPercentage = (completedRequiredFields / requiredFields.length) * 60;
  const optionalPercentage = (completedOptionalFields / optionalFields.length) * 40;
  const totalPercentage = Math.round(requiredPercentage + optionalPercentage);
  
  console.log(`Profile completion calculation:`, {
    required: `${completedRequiredFields}/${requiredFields.length} (${requiredPercentage.toFixed(1)}%)`,
    optional: `${completedOptionalFields}/${optionalFields.length} (${optionalPercentage.toFixed(1)}%)`,
    total: `${totalPercentage}%`
  });
  
  return totalPercentage;
};

export const useProfileCompletion = () => {
  return { calculateProfileCompletionPercentage };
};
