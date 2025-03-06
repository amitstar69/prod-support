
import React from 'react';
import { Rocket, Briefcase, Building, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const TargetAudienceSection: React.FC = () => {
  const audiences = [
    {
      icon: <Rocket className="h-8 w-8 text-[#00B4D8]" />,
      title: "Startups & Solo Founders",
      description: "Get the tech help you need without the overhead of a full-time hire. Scale your development on demand.",
      cta: "Launch faster",
      userType: "client"
    },
    {
      icon: <Briefcase className="h-8 w-8 text-[#00B4D8]" />,
      title: "Agencies & Freelancers",
      description: "Extend your capabilities on client projects. Access specialized expertise exactly when you need it.",
      cta: "Expand your services",
      userType: "client"
    },
    {
      icon: <Building className="h-8 w-8 text-[#00B4D8]" />,
      title: "Corporate Dev Teams",
      description: "Overcome blockers quickly with on-demand specialists. Keep your projects moving forward on schedule.",
      cta: "Accelerate delivery",
      userType: "client"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-[#00B4D8]" />,
      title: "Students & Learners",
      description: "Learn directly from industry professionals. Get personalized guidance on your projects and assignments.",
      cta: "Learn from pros",
      userType: "client"
    }
  ];

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">Who We Help</h2>
          <p className="body-text max-w-2xl mx-auto">
            Our platform serves a diverse range of clients with specialized development needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {audiences.map((audience, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm border border-border/30 flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-[#1E3A8A]/5 flex items-center justify-center flex-shrink-0">
                  {audience.icon}
                </div>
                <h3 className="text-xl font-semibold">{audience.title}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{audience.description}</p>
              <div className="mt-auto">
                <Link 
                  to="/register" 
                  state={{ userType: audience.userType }}
                  className="text-[#1E3A8A] font-medium inline-flex items-center group"
                >
                  {audience.cta}
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
