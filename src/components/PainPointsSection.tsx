
import React from 'react';
import { Zap, Code, BookOpen, Terminal, Shield } from 'lucide-react';
import { Card } from './ui/card';

interface PainPoint {
  icon: JSX.Element;
  title: string;
  description: string;
  ariaLabel: string;
}

const PainPointsSection: React.FC = () => {
  const painPoints: PainPoint[] = [
    {
      icon: <Zap className="h-6 w-6 text-orange-500" aria-hidden="true" />,
      title: "Technical Emergencies",
      description: "Urgent debugging, broken deployments, or last-minute fixes when you're against the clock.",
      ariaLabel: "Learn about our technical emergency support services"
    },
    {
      icon: <Code className="h-6 w-6 text-orange-500" aria-hidden="true" />,
      title: "Short Project Sprints",
      description: "Quick consultations to accelerate development and meet deadlines without delay.",
      ariaLabel: "Learn about our project sprint consultation services"
    },
    {
      icon: <Shield className="h-6 w-6 text-orange-500" aria-hidden="true" />,
      title: "Code Reviews & Best Practices",
      description: "Ensure high-quality code before shipping with expert reviews and recommendations.",
      ariaLabel: "Learn about our code review services"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-orange-500" aria-hidden="true" />,
      title: "Learning & Mentorship",
      description: "Get guidance from experts on complex topics to level up your skills quickly.",
      ariaLabel: "Learn about our mentorship services"
    },
    {
      icon: <Terminal className="h-6 w-6 text-orange-500" aria-hidden="true" />,
      title: "Stack-Specific Expertise",
      description: "Access specialized help for niche frameworks or tools when your team lacks experience.",
      ariaLabel: "Learn about our specialized technical expertise"
    }
  ];

  return (
    <section 
      className="py-16 bg-gradient-to-b from-background to-secondary/20" 
      aria-labelledby="painPointsTitle"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 
            id="painPointsTitle" 
            className="text-3xl font-bold tracking-tight mb-4 text-foreground"
          >
            Solving Developer Challenges
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We make expert coding help accessible in real-time, so developers and businesses never get stuck.
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Developer challenges we solve"
        >
          {painPoints.map((point, index) => (
            <Card
              key={index}
              role="listitem"
              className="p-6 transition-colors hover:bg-secondary/50 focus-within:ring-2 focus-within:ring-primary"
              aria-labelledby={`painPoint-${index}`}
            >
              <div 
                className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4"
                aria-hidden="true"
              >
                {point.icon}
              </div>
              <h3 
                id={`painPoint-${index}`}
                className="text-xl font-semibold mb-2 text-foreground"
              >
                {point.title}
              </h3>
              <p className="text-muted-foreground">
                {point.description}
              </p>
              <div className="sr-only">{point.ariaLabel}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
