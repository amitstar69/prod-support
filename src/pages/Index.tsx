
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import PainPointsSection from '../components/PainPointsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TargetAudienceSection from '../components/TargetAudienceSection';
import DeveloperShowcase from '../components/DeveloperShowcase';
import CTASection from '../components/CTASection';
import { getFeaturedDevelopers, getOnlineDevelopers } from '../data/products';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  useEffect(() => {
    console.log('Index page mounted');
    
    // Track page load performance
    const startTime = performance.now();
    
    // Set loading state and fetch developers with timeout protection
    setIsLoading(true);
    
    const loadTimeout = setTimeout(() => {
      if (isLoading && !contentLoaded) {
        console.warn('Loading homepage content took too long');
        const fallbackDevelopers = getFeaturedDevelopers();
        setDevelopers(fallbackDevelopers);
        setIsLoading(false);
        setContentLoaded(true);
        toast.error('Some content took too long to load. Showing cached data.');
      }
    }, 5000);
    
    try {
      // Attempt to get online developers, fallback to featured
      const onlineDevelopers = getOnlineDevelopers().slice(0, 4);
      const featuredDevelopers = getFeaturedDevelopers();
      
      setDevelopers(onlineDevelopers.length > 0 ? onlineDevelopers : featuredDevelopers);
      setIsLoading(false);
      setContentLoaded(true);
      
      // Log performance metrics
      const loadTime = performance.now() - startTime;
      console.log(`Index page loaded in ${loadTime.toFixed(0)}ms`);
    } catch (error) {
      console.error('Error loading homepage data:', error);
      const fallbackDevelopers = getFeaturedDevelopers();
      setDevelopers(fallbackDevelopers);
      setIsLoading(false);
      setContentLoaded(true);
      toast.error('Error loading developer data. Please try refreshing the page.');
    }
    
    return () => {
      clearTimeout(loadTimeout);
    };
  }, []);
  
  return (
    <Layout>
      <Hero />
      {contentLoaded ? (
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
