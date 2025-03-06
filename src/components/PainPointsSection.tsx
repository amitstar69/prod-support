
import React from 'react';
import { Zap, Code, Shield, BookOpen, Terminal } from 'lucide-react';

const PainPointsSection: React.FC = () => {
  const painPoints = [
    {
      icon: <Zap className="h-6 w-6 text-[#FF8800]" />,
      title: "Technical Emergencies",
      description: "Urgent debugging, broken deployments, or last-minute fixes when you're against the clock."
    },
    {
      icon: <Code className="h-6 w-6 text-[#FF8800]" />,
      title: "Short Project Sprints",
      description: "Quick consultations to accelerate development and meet deadlines without delay."
    },
    {
      icon: <Shield className="h-6 w-6 text-[#FF8800]" />,
      title: "Code Reviews & Best Practices",
      description: "Ensure high-quality code before shipping with expert reviews and recommendations."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-[#FF8800]" />,
      title: "Learning & Mentorship",
      description: "Get guidance from experts on complex topics to level up your skills quickly."
    },
    {
      icon: <Terminal className="h-6 w-6 text-[#FF8800]" />,
      title: "Stack-Specific Expertise",
      description: "Access specialized help for niche frameworks or tools when your team lacks experience."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#F8FBFF]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">Solving Developer Challenges</h2>
          <p className="body-text max-w-2xl mx-auto">
            We make expert coding help accessible in real-time, so developers and businesses never get stuck.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map((point, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-border/30 transition-all hover:shadow-md hover:border-[#00B4D8]/30 flex flex-col h-full"
            >
              <div className="h-12 w-12 rounded-lg bg-[#1E3A8A]/5 flex items-center justify-center mb-4">
                {point.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{point.title}</h3>
              <p className="text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
