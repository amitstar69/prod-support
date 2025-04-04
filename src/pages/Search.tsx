
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import CategoryList from '../components/CategoryList';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { categories } from '../data/categories';
import { getDevelopers, searchDevelopers } from '../data/products';
import { Developer } from '../types/product';

const Search: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get search parameters
  const searchQuery = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';

  // Handle search from search bar
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated or not a client
    if (!isAuthenticated) {
      toast.error('Please log in as a client to find developers');
      navigate('/login', { state: { returnTo: '/search' } });
      return;
    }

    if (isAuthenticated && userType !== 'client') {
      toast.error('Only clients can search for developers');
      navigate('/');
    }
  }, [isAuthenticated, userType, navigate]);

  useEffect(() => {
    // Load developers based on search criteria
    setIsLoading(true);

    let filteredDevelopers: Developer[] = [];
    
    // Apply search and/or category filters
    if (searchQuery) {
      filteredDevelopers = searchDevelopers(searchQuery);
    } else if (categoryId) {
      filteredDevelopers = getDevelopers().filter(dev => dev.category === categoryId);
    } else {
      filteredDevelopers = getDevelopers();
    }

    setDevelopers(filteredDevelopers);
    setIsLoading(false);
  }, [searchQuery, categoryId]);

  if (!isAuthenticated || userType !== 'client') {
    return null; // Don't render anything while redirecting
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Expert Developers</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our curated list of experienced developers, or use the search bar to find the perfect match for your project needs.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <SearchBar 
            initialValue={searchQuery} 
            onSearch={handleSearch} 
          />
        </div>

        <CategoryList categories={categories} />
        
        <div className="mt-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProductGrid products={developers} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
