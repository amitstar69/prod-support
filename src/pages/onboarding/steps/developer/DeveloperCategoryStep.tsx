
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Card, CardContent } from '../../../../components/ui/card';
import { toast } from 'sonner';

const DeveloperCategoryStep = () => {
  const { state, setStepData, saveProgress } = useOnboarding();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 2;
    if (state.stepData[stepNumber]?.category) {
      setSelectedCategory(state.stepData[stepNumber].category);
    }
  }, [state.stepData]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    
    // Save to onboarding context
    setStepData(2, { category: value });
    
    // Auto-save to database after selection
    saveProgress({ category: value }).catch(error => {
      console.error('Error saving category:', error);
    });
  };

  const categories = [
    { value: 'frontend', label: 'Frontend Development', 
      description: 'Specializing in user interfaces, client-side logic, and web experiences using technologies like React, Vue, or Angular.' },
    { value: 'backend', label: 'Backend Development', 
      description: 'Focusing on server-side applications, APIs, and business logic using Node.js, Python, Java, or other server technologies.' },
    { value: 'fullstack', label: 'Full Stack Development', 
      description: 'Proficient in both client and server-side development with end-to-end implementation skills.' },
    { value: 'mobile', label: 'Mobile Development', 
      description: 'Creating applications for iOS, Android, or cross-platform using React Native, Flutter, or native development.' },
    { value: 'devops', label: 'DevOps Engineering', 
      description: 'Managing infrastructure, CI/CD pipelines, and deployment automation for reliable operations.' },
    { value: 'database', label: 'Database Engineering', 
      description: 'Specializing in database design, optimization, and data management solutions.' },
    { value: 'security', label: 'Security Engineering', 
      description: 'Focusing on application security, penetration testing, and implementing secure coding practices.' },
    { value: 'ai', label: 'AI & Machine Learning', 
      description: 'Developing machine learning models, AI solutions, and intelligent applications.' },
    { value: 'data', label: 'Data Science & Analytics', 
      description: 'Working with data processing, analysis, visualization, and data-driven solutions.' },
    { value: 'gamedev', label: 'Game Development', 
      description: 'Creating interactive experiences using game engines and graphics programming.' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Primary Development Category</label>
        <p className="text-sm text-muted-foreground">
          This helps us match you with the right clients seeking your expertise
        </p>
        
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your primary category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedCategory && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">
              {categories.find(c => c.value === selectedCategory)?.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {categories.find(c => c.value === selectedCategory)?.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeveloperCategoryStep;
