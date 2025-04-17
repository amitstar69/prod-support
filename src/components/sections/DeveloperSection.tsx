
import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const DeveloperSection = () => {
  const navigate = useNavigate();
  
  const benefits = [
    "Access high-quality client projects",
    "Set your own rates and schedule",
    "Get paid securely and on time",
    "Join a community of expert developers"
  ];

  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="public/lovable-uploads/43e7ef3a-3d05-4a8d-96b6-7e5373299c70.png"
                alt="Developer working"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Grow your career as a <br />
              <span className="text-primary">developer</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join our platform to find meaningful projects, collaborate with clients worldwide,
              and build your freelance business.
            </p>
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/register', { state: { userType: 'developer' } })} 
                className="flex items-center"
              >
                Join as a Developer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/developer-dashboard')}
              >
                View Available Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeveloperSection;
