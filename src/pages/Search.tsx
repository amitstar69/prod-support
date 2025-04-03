import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import { categories } from '../data/categories';
import { Filter, X, Star, Code, Award, MapPin, Globe } from 'lucide-react';
import { Developer, Product } from '../types/product';
import { useDeveloperSearch, DeveloperFilters } from '../hooks/useDeveloperSearch';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { createSampleDeveloperProfiles } from '../utils/developerDataFallback';
import { toast } from 'sonner';
import DeveloperPagination from '../components/ui/DeveloperPagination';

const commonSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 
  'AWS', 'Docker', 'SQL', 'Flutter', 'Java', 'CSS', 'HTML',
  'GraphQL', 'Next.js', 'Vue.js', 'Angular', 'MongoDB', 'Firebase'
];

const experienceLevels = [
  { value: 'all', label: 'Any Experience' },
  { value: 'beginner', label: 'Entry Level (1-2 years)' },
  { value: 'intermediate', label: 'Intermediate (3-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' }
];

const locations = [
  { value: 'all', label: 'Any Location' },
  { value: 'remote', label: 'Remote' },
  { value: 'us', label: 'United States' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'canada', label: 'Canada' },
  { value: 'australia', label: 'Australia' }
];

const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  const categoryFilter = queryParams.get('category') || '';
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const initialFilters: DeveloperFilters = {
    selectedCategories: categoryFilter ? [categoryFilter] : [],
    hourlyRateRange: [0, 200],
    availableOnly: false,
    searchQuery,
    selectedSkills: [],
    experienceLevel: 'all',
    location: 'all'
  };
  
  const { 
    filteredDevelopers, 
    filters, 
    updateFilter,
    isLoading,
    error,
    refreshDevelopers,
    pagination,
    setPage
  } = useDeveloperSearch(initialFilters);
  
  useEffect(() => {
    const checkAndCreateFallbacks = async () => {
      if (!isLoading && filteredDevelopers.length === 0 && !error && !hasAttemptedDevFallback) {
        setHasAttemptedDevFallback(true);
        console.log('No developers found, attempting to create fallbacks...');
        
        try {
          await createSampleDeveloperProfiles();
          refreshDevelopers();
        } catch (err) {
          console.error('Error creating fallback developers:', err);
        }
      }
    };
    
    checkAndCreateFallbacks();
  }, [isLoading, filteredDevelopers, error, hasAttemptedDevFallback, refreshDevelopers]);
  
  useEffect(() => {
    if (error) {
      toast.error('Error loading developers', {
        description: error
      });
    }
  }, [error]);

  const handleCategoryChange = (categoryId: string) => {
    const updatedCategories = filters.selectedCategories.includes(categoryId)
      ? filters.selectedCategories.filter(id => id !== categoryId)
      : [...filters.selectedCategories, categoryId];
      
    updateFilter('selectedCategories', updatedCategories);
    
    if (categoryId === categoryFilter) {
      const params = new URLSearchParams(location.search);
      params.delete('category');
      navigate({ search: params.toString() });
    }
  };
  
  const handleHourlyRateChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(event.target.value);
    const newRange = [...filters.hourlyRateRange] as [number, number];
    newRange[index] = value;
    updateFilter('hourlyRateRange', newRange);
  };
  
  const handleSkillChange = (skill: string) => {
    const updatedSkills = filters.selectedSkills.includes(skill)
      ? filters.selectedSkills.filter(s => s !== skill)
      : [...filters.selectedSkills, skill];
      
    updateFilter('selectedSkills', updatedSkills);
  };
  
  const handleExperienceLevelChange = (level: string) => {
    updateFilter('experienceLevel', level);
  };
  
  const handleLocationChange = (loc: string) => {
    updateFilter('location', loc);
  };
  
  const clearAllFilters = () => {
    updateFilter('selectedCategories', []);
    updateFilter('hourlyRateRange', [0, 200]);
    updateFilter('availableOnly', false);
    updateFilter('selectedSkills', []);
    updateFilter('experienceLevel', 'all');
    updateFilter('location', 'all');
    
    if (categoryFilter) {
      const params = new URLSearchParams(location.search);
      params.delete('category');
      navigate({ search: params.toString() });
    }
  };
  
  const hasActiveFilters = 
    filters.selectedCategories.length > 0 || 
    filters.hourlyRateRange[0] > 0 || 
    filters.hourlyRateRange[1] < 200 || 
    filters.availableOnly || 
    filters.selectedSkills.length > 0 ||
    filters.experienceLevel !== 'all' ||
    filters.location !== 'all';
  
  useEffect(() => {
    if (searchQuery !== filters.searchQuery) {
      updateFilter('searchQuery', searchQuery);
    }
    
    if (categoryFilter && !filters.selectedCategories.includes(categoryFilter)) {
      updateFilter('selectedCategories', [...filters.selectedCategories, categoryFilter]);
    }
  }, [searchQuery, categoryFilter]);
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-6 text-center">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Developers'}
          </h1>
          <div className="max-w-2xl mx-auto">
            <SearchBar initialValue={searchQuery} />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-8">
          <div className="lg:hidden flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading 
                ? 'Loading developers...' 
                : `Showing ${filteredDevelopers.length} of ${pagination.totalCount} developers`
              }
            </p>
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
          
          <div 
            className={`
              fixed inset-0 z-40 lg:relative lg:z-0 lg:block
              ${isMobileFilterOpen ? 'block' : 'hidden'}
            `}
          >
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            
            <div className="fixed right-0 top-0 h-full w-[300px] border-l border-border bg-background p-6 shadow-lg animate-slide-in-right lg:animate-none lg:relative lg:right-auto lg:top-auto lg:h-auto lg:w-auto lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none overflow-auto">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {hasActiveFilters && (
                  <div className="pb-4 border-b border-border/60">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-primary font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.availableOnly}
                      onChange={() => updateFilter('availableOnly', !filters.availableOnly)}
                      className="rounded border-border/70 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium">Available now</span>
                  </label>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3">Specialization</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label 
                        key={category.id} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="rounded border-border/70 text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Code className="h-4 w-4" />
                    <h3>Skills & Technologies</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonSkills.map(skill => (
                      <Badge 
                        key={skill}
                        variant="outline" 
                        className={`cursor-pointer ${
                          filters.selectedSkills.includes(skill) 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-transparent'
                        }`}
                        onClick={() => handleSkillChange(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Award className="h-4 w-4" />
                    <h3>Experience Level</h3>
                  </div>
                  <div className="space-y-2">
                    {experienceLevels.map(level => (
                      <label 
                        key={level.value} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="experienceLevel"
                          checked={filters.experienceLevel === level.value}
                          onChange={() => handleExperienceLevelChange(level.value)}
                          className="rounded-full border-border/70 text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm">{level.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <MapPin className="h-4 w-4" />
                    <h3>Location</h3>
                  </div>
                  <div className="space-y-2">
                    {locations.map(loc => (
                      <label 
                        key={loc.value} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="location"
                          checked={filters.location === loc.value}
                          onChange={() => handleLocationChange(loc.value)}
                          className="rounded-full border-border/70 text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm">{loc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-3">Hourly Rate Range</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="px-2 bg-muted text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          value={filters.hourlyRateRange[0]}
                          onChange={(e) => handleHourlyRateChange(e, 0)}
                          min={0}
                          max={filters.hourlyRateRange[1]}
                          className="w-16 h-8 text-sm border-0 focus:ring-0"
                        />
                      </div>
                      <span className="text-muted-foreground">to</span>
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="px-2 bg-muted text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          value={filters.hourlyRateRange[1]}
                          onChange={(e) => handleHourlyRateChange(e, 1)}
                          min={filters.hourlyRateRange[0]}
                          className="w-16 h-8 text-sm border-0 focus:ring-0"
                        />
                      </div>
                    </div>
                    
                    <div className="px-1">
                      <input
                        type="range"
                        min={0}
                        max={200}
                        value={filters.hourlyRateRange[1]}
                        onChange={(e) => handleHourlyRateChange(e, 1)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="hidden lg:flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                {isLoading 
                  ? 'Loading developers...' 
                  : `Showing ${filteredDevelopers.length} of ${pagination.totalCount} developers`
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            {isLoading && pagination.page === 1 ? (
              <div className="py-20 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading developers...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <h3 className="heading-3 mb-2">Error loading developers</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <button 
                  onClick={refreshDevelopers}
                  className="button-secondary"
                >
                  Try Again
                </button>
              </div>
            ) : filteredDevelopers.length > 0 ? (
              <>
                <ProductGrid products={filteredDevelopers as Product[]} />
                
                <DeveloperPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <div className="py-20 text-center">
                <h3 className="heading-3 mb-2">No developers found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button 
                  onClick={() => {
                    clearAllFilters();
                    refreshDevelopers();
                  }}
                  className="button-secondary"
                >
                  Clear all filters and refresh
                </button>
              </div>
            )}
            
            {isLoading && pagination.page > 1 && (
              <div className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading more developers...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
