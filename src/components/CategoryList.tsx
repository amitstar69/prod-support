
import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types/product';

interface CategoryListProps {
  categories: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {categories.map((category) => (
        <Link 
          key={category.id}
          to={`/search?category=${category.id}`}
          className="group relative overflow-hidden rounded-xl aspect-[4/3] shadow-sm card-hover"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/5 z-10"></div>
          <img 
            src={category.image} 
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
            <h3 className="text-xl font-semibold text-white">{category.name}</h3>
            <p className="mt-1 text-sm text-white/80">
              <span className="relative inline-block">
                Shop now 
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;
