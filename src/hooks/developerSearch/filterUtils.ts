
import { Developer } from '../../types/product';
import { DeveloperFilters } from './types';

/**
 * Applies all active filters to the developer list
 */
export const applyFilters = (
  developers: Developer[], 
  filters: DeveloperFilters, 
  page: number, 
  pageSize: number
): { results: Developer[], hasMore: boolean } => {
  const {
    selectedCategories,
    hourlyRateRange,
    availableOnly,
    searchQuery,
    selectedSkills,
    experienceLevel,
    location
  } = filters;

  let results = [...developers];
  
  console.log(`Applying filters to ${results.length} developers`);
  
  // Filter by search query
  if (searchQuery) {
    const lowercaseQuery = searchQuery.toLowerCase();
    results = results.filter(
      dev =>
        (dev.name && dev.name.toLowerCase().includes(lowercaseQuery)) ||
        (dev.description && dev.description.toLowerCase().includes(lowercaseQuery)) ||
        (dev.category && dev.category.toLowerCase().includes(lowercaseQuery)) ||
        (dev.skills && dev.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)))
    );
  }
  
  // Filter by category
  if (selectedCategories.length > 0) {
    results = results.filter(dev => selectedCategories.includes(dev.category));
  }
  
  // Filter by hourly rate range
  results = results.filter(
    dev => dev.hourlyRate >= hourlyRateRange[0] && dev.hourlyRate <= hourlyRateRange[1]
  );
  
  // Filter by availability
  if (availableOnly) {
    results = results.filter(dev => dev.availability);
  }
  
  // Filter by skills
  if (selectedSkills.length > 0) {
    results = results.filter(dev => 
      dev.skills && selectedSkills.some(skill => dev.skills.includes(skill))
    );
  }
  
  // Filter by experience level
  if (experienceLevel && experienceLevel !== 'all') {
    results = results.filter(dev => {
      if (!dev.experience) return experienceLevel === 'beginner';
      
      if (experienceLevel === 'beginner' && 
          (dev.experience.includes('1') || dev.experience.toLowerCase().includes('entry'))) {
        return true;
      } else if (experienceLevel === 'intermediate' && 
          (dev.experience.includes('2') || dev.experience.includes('3') || 
           dev.experience.includes('4') || dev.experience.toLowerCase().includes('mid'))) {
        return true;
      } else if (experienceLevel === 'expert' && 
          (dev.experience.includes('5+') || dev.experience.includes('6+') || 
           dev.experience.includes('7+') || dev.experience.includes('8+') ||
           dev.experience.includes('9+') || dev.experience.includes('10+') ||
           dev.experience.toLowerCase().includes('senior') || 
           dev.experience.toLowerCase().includes('expert'))) {
        return true;
      } else if (experienceLevel === 'all') {
        return true;
      }
      return false;
    });
  }
  
  // Filter by location
  if (location && location !== 'all') {
    results = results.filter(dev => 
      dev.location && dev.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  console.log(`After applying filters: ${results.length} developers match criteria`);
  
  // Simulate pagination
  const pagedResults = results.slice(0, page * pageSize);
  const hasMore = pagedResults.length < results.length;
  
  return { results: pagedResults, hasMore };
};
