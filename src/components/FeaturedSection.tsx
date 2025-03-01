
import React from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from './ProductGrid';
import { Product } from '../types/product';

interface FeaturedSectionProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllLink?: string;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ 
  title, 
  description, 
  products,
  viewAllLink
}) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10">
          <div>
            <h2 className="heading-2 mb-2">{title}</h2>
            {description && (
              <p className="text-muted-foreground max-w-2xl">{description}</p>
            )}
          </div>
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="mt-4 md:mt-0 group inline-flex items-center text-primary font-medium"
            >
              View all
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
          )}
        </div>
        
        <ProductGrid products={products} />
      </div>
    </section>
  );
};

export default FeaturedSection;
