
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types/product';
import { products as defaultProducts } from '../data/products';

interface ProductGridProps {
  products?: Product[];
  columns?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products = defaultProducts, 
  columns = 4 
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 5:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      default:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium mb-2">No developers found</h3>
        <p className="text-muted-foreground">Try adjusting your search criteria or check back later.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridClass()} gap-4 md:gap-6`}>
      {products.map((product) => (
        <div key={product.id} className="animate-fade-in">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
