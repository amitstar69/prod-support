
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Developer } from '../../../../types/product';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';

const DeveloperSkillsStep: React.FC = () => {
  const { userData, updateUserDataAndProceed } = useOnboarding();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: userData && 'category' in userData ? userData.category || 'frontend' : 'frontend',
    skills: userData && 'skills' in userData ? (userData.skills || []).join(', ') : '',
    experience: userData && 'experience' in userData ? userData.experience || '' : '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        category: 'category' in userData ? userData.category || 'frontend' : 'frontend',
        skills: 'skills' in userData ? (userData.skills || []).join(', ') : '',
        experience: 'experience' in userData ? userData.experience || '' : '',
      });
    }
  }, [userData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Parse skills from comma-separated string to array
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      // Type guard to ensure we're dealing with a Developer
      const developerData: Partial<Developer> = {
        category: formData.category,
        skills: skillsArray,
        experience: formData.experience,
        profileCompletionPercentage: 50, // 50% complete after skills
      };
      
      await updateUserDataAndProceed(developerData);
    } catch (error) {
      console.error('Error updating skills info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <OnboardingLayout 
      title="Your Skills"
      subtitle="Tell us about your expertise and technical skills"
      onNextStep={handleSubmit}
      nextDisabled={isSubmitting}
      onBackStep={() => navigate(-1)}
    >
      <div className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Primary Specialization
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="frontend">Frontend Development</option>
            <option value="backend">Backend Development</option>
            <option value="fullstack">Full Stack Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="devops">DevOps</option>
            <option value="database">Database Engineering</option>
            <option value="security">Security</option>
            <option value="ai">AI & Machine Learning</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="skills" className="block text-sm font-medium mb-1">
            Technical Skills (comma separated)
          </label>
          <textarea
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="JavaScript, React, Node.js, etc."
            rows={3}
            required
          />
        </div>
        
        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-1">
            Experience Summary
          </label>
          <input
            id="experience"
            name="experience"
            type="text"
            value={formData.experience}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="E.g. '5+ years full stack development'"
            required
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperSkillsStep;
