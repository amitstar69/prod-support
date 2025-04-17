
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import PainPointsSection from '../components/PainPointsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TargetAudienceSection from '../components/TargetAudienceSection';
import DeveloperShowcase from '../components/DeveloperShowcase';
import CTASection from '../components/CTASection';
import { getFeaturedDevelopers, getOnlineDevelopers } from '../data/products';
import { useAuth } from '../contexts/auth';
import { getUserHomePage } from '../utils/navigationUtils';

const Index: React.FC = () => {
  const { isAuthenticated, userId, userType } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  useEffect(() => {
    console.log('Index page mounted');
    
    // Track page load performance
    const startTime = performance.now();
    
    // Set loading state
    setIsLoading(true);
    
    // Load featured developers immediately to avoid empty state
    const featuredDevelopers = getFeaturedDevelopers();
    setDevelopers(featuredDevelopers);
    
    // Set a shorter timeout for better UX
    const loadTimeout = setTimeout(() => {
      if (isLoading && !contentLoaded) {
        console.log('Using cached featured developers data');
        setIsLoading(false);
        setContentLoaded(true);
      }
    }, 2000);
    
    // Attempt to get online developers
    try {
      const onlineDevelopers = getOnlineDevelopers().slice(0, 4);
      
      if (onlineDevelopers.length > 0) {
        setDevelopers(onlineDevelopers);
      }
      
      setIsLoading(false);
      setContentLoaded(true);
      
      // Log performance metrics
      const loadTime = performance.now() - startTime;
      console.log(`Index page loaded in ${loadTime.toFixed(0)}ms`);
    } catch (error) {
      console.error('Error loading developer data:', error);
      // We already set featured developers as fallback, so just log the error
      setIsLoading(false);
      setContentLoaded(true);
    }
    
    return () => {
      clearTimeout(loadTimeout);
    };
  }, [isLoading]);
  
  // Redirect authenticated users to their home page
  useEffect(() => {
    if (isAuthenticated && userType) {
      const homePath = getUserHomePage(userType);
      navigate(homePath);
    }
  }, [isAuthenticated, userType, navigate]);
  
  return (
    <Layout>
      <Hero />
      {contentLoaded || !isLoading ? (
        <DeveloperShowcase developers={developers} />
      ) : (
        <div className="py-8 text-center">
          <div className="animate-pulse mx-auto max-w-6xl px-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 w-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      )}
      <PainPointsSection />
      <HowItWorksSection />
      <TargetAudienceSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
