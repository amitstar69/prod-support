import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/product';
import { Heart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const displaySkills = product.skills || [];
  
  const formattedHourlyRate = typeof product.hourlyRate === 'number' 
    ? product.hourlyRate.toFixed(2) 
    : '0.00';
  
  const isOnline = product.online === true;
  const availability = typeof product.availability === 'boolean' 
    ? product.availability 
    : false;
  
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
        <div className="aspect-square overflow-hidden bg-secondary/30">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-muted-foreground">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </p>
            <div className="flex items-center text-amber-500">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="ml-1 text-xs font-medium">{product.rating}</span>
            </div>
          </div>
          
          <h3 className="text-base font-medium text-foreground line-clamp-1 mb-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold">${formattedHourlyRate}</p>
            <button 
              className="text-xs font-medium text-primary py-1 px-3 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              Add to cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
