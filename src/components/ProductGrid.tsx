
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types/product';

interface ProductGridProps {
  products: Product[];
  columns?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, columns = 4 }) => {
  // Guard against undefined products
  if (!products) {
    return (
      <div className="bg-muted/20 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">Loading developers...</p>
      </div>
    );
  }
  
  // Empty state
  if (products.length === 0) {
    return (
      <div className="bg-muted/20 rounded-lg p-8 text-center">
        <h3 className="text-xl font-medium mb-2">No developers found</h3>
        <p className="text-muted-foreground">Try adjusting your search filters</p>
      </div>
    );
  }

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
