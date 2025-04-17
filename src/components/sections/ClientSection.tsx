
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const ClientSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Find expert developers <br />
              <span className="text-primary">your way</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Work with our network of skilled developers and get your projects done—from
              quick fixes to complete transformations.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-card p-6 rounded-lg border border-border/50 hover:border-border transition-colors">
                <h3 className="font-semibold mb-2">Post a project</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your needs and get matched with qualified developers
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border/50 hover:border-border transition-colors">
                <h3 className="font-semibold mb-2">Browse developers</h3>
                <p className="text-sm text-muted-foreground">
                  Explore profiles and choose the perfect match for your project
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/get-help')} 
                className="flex items-center"
              >
                Post a Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/search')}
              >
                Browse Developers
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/lovable-uploads/43e7ef3a-3d05-4a8d-96b6-7e5373299c70.png"
                alt="Client collaborating with developer"
                className="w-full h-auto object-cover aspect-[4/3]"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.warn('Image failed to load:', target.src);
                  target.src = '/placeholder.svg';
                  target.onerror = null; // Prevent infinite error loop
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientSection;
