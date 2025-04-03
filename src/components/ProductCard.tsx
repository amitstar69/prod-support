
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product';
import { Heart, Star, UserCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Ensure we have valid data with fallbacks
  const displaySkills = product.skills || [];
  
  const formattedHourlyRate = typeof product.hourlyRate === 'number' 
    ? product.hourlyRate.toFixed(2) 
    : '0.00';
  
  const isOnline = product.online === true;
  const availability = typeof product.availability === 'boolean' 
    ? product.availability 
    : false;
  
  // Get developer's name (either full name or username as fallback)
  const developerName = product.name || 'Developer';
  
  // Safely handle image loading
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
    target.onerror = null; // Prevent infinite fallback loops
  };

  // Determine if we need to use a fallback image
  const imageUrl = product.image && product.image !== '/placeholder.svg' 
    ? product.image 
    : '/placeholder.svg';

  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-white border border-border/40 card-hover"
    >
      <div className="absolute top-3 right-3 z-10">
        <button 
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-foreground/70 hover:text-rose-500 transition-colors" />
        </button>
      </div>
      
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-secondary/30 relative">
          {isOnline && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Online now
              </span>
            </div>
          )}
          {imageUrl === '/placeholder.svg' ? (
            <div className="h-full w-full flex items-center justify-center bg-secondary/30">
              <UserCircle className="h-32 w-32 text-muted-foreground/40" />
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={developerName}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={handleImageError}
            />
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-primary">
              {product.category ? (product.category.charAt(0).toUpperCase() + product.category.slice(1)) : 'Developer'}
            </p>
            <div className="flex items-center text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="ml-1 text-xs font-medium">{product.rating || 4.5}</span>
            </div>
          </div>
          
          <h3 className="text-base font-semibold text-foreground/90 line-clamp-1 mb-2">
            {developerName}
          </h3>
          
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {displaySkills.slice(0, 3).map((skill, index) => (
                <span 
                  key={index} 
                  className="px-1.5 py-0.5 text-xs rounded-full bg-secondary/70 text-foreground/80"
                >
                  {skill}
                </span>
              ))}
              {displaySkills.length > 3 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-secondary/70 text-foreground/80">
                  +{displaySkills.length - 3}
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-primary">${formattedHourlyRate}/hr</p>
            <div className={`text-xs px-2 py-1 rounded-full ${availability ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {availability ? 'Available' : 'Unavailable'}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
