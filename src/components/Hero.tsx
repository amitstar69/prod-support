
import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_70%,rgba(120,180,250,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-3/5 lg:pr-12 mb-12 lg:mb-0">
            <div className="mb-4 inline-block">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                New Collection
              </span>
            </div>
            <h1 className="heading-1 mb-6">
              Discover products <span className="text-primary">crafted</span> with exceptional attention to detail
            </h1>
            <p className="body-text mb-8 max-w-2xl">
              Explore our curated collection of premium products designed to elevate your everyday experiences. Each item has been carefully selected for its quality, design, and functionality.
            </p>
            
            <div className="space-y-6">
              <SearchBar className="max-w-md" />
              
              <div className="flex flex-wrap gap-3">
                <Link to="/search?category=electronics" className="inline-flex items-center rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  Electronics
                </Link>
                <Link to="/search?category=accessories" className="inline-flex items-center rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  Accessories
                </Link>
                <Link to="/search?category=wearables" className="inline-flex items-center rounded-full border border-border/60 px-4 py-2 text-sm hover:border-primary/30 hover:bg-primary/5 transition-colors">
                  Wearables
                </Link>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-2/5 relative">
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1606422354616-26ebed468bf8?q=80&w=1600&auto=format&fit=crop"
                  alt="Featured product"
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-white/90 backdrop-blur-sm p-4 shadow-lg border border-border/20 max-w-[200px] animate-float">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Premium Quality</p>
                    <p className="text-xs text-muted-foreground">Carefully selected materials</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 rounded-xl bg-white/90 backdrop-blur-sm p-4 shadow-lg border border-border/20 max-w-[200px] animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over $100</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
