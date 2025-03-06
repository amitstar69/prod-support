
import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import PainPointsSection from '../components/PainPointsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TargetAudienceSection from '../components/TargetAudienceSection';
import DeveloperShowcase from '../components/DeveloperShowcase';
import CTASection from '../components/CTASection';
import { getFeaturedDevelopers, getOnlineDevelopers } from '../data/products';

const Index: React.FC = () => {
  const featuredDevelopers = getFeaturedDevelopers();
  const onlineDevelopers = getOnlineDevelopers().slice(0, 4);
  
  return (
    <Layout>
      <Hero />
      <DeveloperShowcase developers={onlineDevelopers.length > 0 ? onlineDevelopers : featuredDevelopers} />
      <PainPointsSection />
      <HowItWorksSection />
      <TargetAudienceSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
