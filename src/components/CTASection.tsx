
import React from 'react';
import { Link } from 'react-router-dom';
import { Building, GraduationCap } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="heading-2 mb-4">Ready to Get Started?</h2>
          <p className="body-text text-muted-foreground max-w-2xl mx-auto">
            Choose your path below and join our growing community of professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Hire Developers CTA */}
          <div className="bg-white border border-border/40 rounded-xl p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I'm looking to hire</h3>
            <p className="text-muted-foreground mb-6">
              Find top developers to help with your projects
            </p>
            <Link 
              to="/register" 
              state={{ userType: 'client' }}
              className="button-primary w-full"
            >
              Hire Developers
            </Link>
          </div>
          
          {/* Join as Developer CTA */}
          <div className="bg-white border border-border/40 rounded-xl p-8 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">I want to offer Pro services</h3>
            <p className="text-muted-foreground mb-6">
              Share your expertise and earn by helping others
            </p>
            <Link 
              to="/register" 
              state={{ userType: 'developer' }}
              className="button-secondary w-full"
            >
              Join as Developer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
