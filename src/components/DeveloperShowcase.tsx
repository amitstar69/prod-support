
import React from 'react';
import { Link } from 'react-router-dom';
import { Developer } from '../types/product';
import { Shield, Clock, User } from 'lucide-react';

interface DeveloperShowcaseProps {
  developers: Developer[];
}

const DeveloperShowcase: React.FC<DeveloperShowcaseProps> = ({ developers }) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="heading-2 mb-2">Expert Developers Ready to Help</h2>
            <p className="text-muted-foreground max-w-2xl">
              Connect with our top specialists for immediate assistance on your projects
            </p>
          </div>
          <Link 
            to="/search"
            className="mt-4 md:mt-0 group inline-flex items-center text-[#1E3A8A] font-medium"
          >
            Browse all developers
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {developers.map((developer) => (
            <div 
              key={developer.id}
              className="bg-white rounded-xl shadow-sm border border-border/30 overflow-hidden transition-all hover:shadow-md hover:border-[#00B4D8]/30"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={developer.image} 
                  alt={developer.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.warn('Developer image failed to load:', target.src);
                    target.src = '/placeholder.svg';
                    target.onerror = null; // Prevent infinite error loop
                    
                    // Add a placeholder background
                    target.parentElement?.classList.add('bg-muted');
                    
                    // Add a fallback icon
                    const fallbackIcon = document.createElement('div');
                    fallbackIcon.className = 'absolute inset-0 flex items-center justify-center';
                    fallbackIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
                    target.parentElement?.appendChild(fallbackIcon);
                  }}
                />
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${developer.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {developer.online ? 'Available Now' : developer.lastActive}
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg truncate">{developer.name}</h3>
                  <span className="flex items-center text-sm font-medium">
                    <svg className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {developer.rating}
                  </span>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{developer.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {developer.skills.slice(0, 3).map((skill, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 text-xs rounded-full bg-[#1E3A8A]/5 text-[#1E3A8A]"
                    >
                      {skill}
                    </span>
                  ))}
                  {developer.skills.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-[#1E3A8A]/5 text-[#1E3A8A]">
                      +{developer.skills.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-auto">
                  <div className="text-[#00B4D8] font-medium">
                    ${developer.hourlyRate}/hr
                  </div>
                  <Link 
                    to={`/product/${developer.id}`}
                    className="text-sm font-medium text-[#1E3A8A] hover:text-[#00B4D8] transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeveloperShowcase;
