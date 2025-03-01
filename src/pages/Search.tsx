
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import { searchProducts, getProductsByCategory, products } from '../data/products';
import { categories } from '../data/categories';
import { Filter, X, Star } from 'lucide-react';
import { Product } from '../types/product';

const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  const categoryFilter = queryParams.get('category') || '';
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? [categoryFilter] : []
  );
  const [minRating, setMinRating] = useState(0);
  
  useEffect(() => {
    // Reset mobile filter state on location change
    setIsMobileFilterOpen(false);
    
    // Update selected categories when categoryFilter changes
    if (categoryFilter && !selectedCategories.includes(categoryFilter)) {
      setSelectedCategories([...selectedCategories, categoryFilter]);
    }
    
    // Filter products based on search query and filters
    let results = searchQuery 
      ? searchProducts(searchQuery) 
      : [...products];
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      results = results.filter(product => selectedCategories.includes(product.category));
    }
    
    // Apply price range filter
    results = results.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply rating filter
    if (minRating > 0) {
      results = results.filter(product => product.rating >= minRating);
    }
    
    setFilteredProducts(results);
  }, [location.search, selectedCategories, priceRange, minRating]);
  
  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseInt(event.target.value);
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    setPriceRange(newRange);
  };
  
  const handleRatingChange = (rating: number) => {
    setMinRating(rating === minRating ? 0 : rating);
  };
  
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setMinRating(0);
    
    // If there was a category in the URL, remove it
    if (categoryFilter) {
      const params = new URLSearchParams(location.search);
      params.delete('category');
      navigate({ search: params.toString() });
    }
  };
  
  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000 || minRating > 0;
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-6 text-center">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
          </h1>
          <div className="max-w-2xl mx-auto">
            <SearchBar initialValue={searchQuery} />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} results
            </p>
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
          
          {/* Filters Sidebar */}
          <div 
            className={`
              fixed inset-0 z-40 lg:relative lg:z-0 lg:block
              ${isMobileFilterOpen ? 'block' : 'hidden'}
            `}
          >
            {/* Mobile Filter Backdrop */}
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            
            {/* Filter Content */}
            <div className="fixed right-0 top-0 h-full w-[300px] border-l border-border bg-background p-6 shadow-lg animate-slide-in-right lg:animate-none lg:relative lg:right-auto lg:top-auto lg:h-auto lg:w-auto lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-md p-1 hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Clear All Filters */}
                {hasActiveFilters && (
                  <div className="pb-4 border-b border-border/60">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-primary font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
                
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label 
                        key={category.id} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="rounded border-border/70 text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="px-2 bg-muted text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => handlePriceChange(e, 0)}
                          min={0}
                          max={priceRange[1]}
                          className="w-16 h-8 text-sm border-0 focus:ring-0"
                        />
                      </div>
                      <span className="text-muted-foreground">to</span>
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <span className="px-2 bg-muted text-muted-foreground text-sm">$</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => handlePriceChange(e, 1)}
                          min={priceRange[0]}
                          className="w-16 h-8 text-sm border-0 focus:ring-0"
                        />
                      </div>
                    </div>
                    
                    <div className="px-1">
                      <input
                        type="range"
                        min={0}
                        max={1000}
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Rating */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <button 
                        key={rating}
                        onClick={() => handleRatingChange(rating)} 
                        className={`flex items-center w-full py-1 px-2 rounded-md ${
                          minRating === rating ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < rating ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm">& Up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div>
            <div className="hidden lg:flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} results
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="py-20 text-center">
                <h3 className="heading-3 mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button 
                  onClick={clearAllFilters}
                  className="button-secondary"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
