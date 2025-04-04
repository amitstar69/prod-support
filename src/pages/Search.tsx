import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import CategoryList from '../components/CategoryList';
import { useAuth } from '../contexts/auth';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { categories } from '../data/categories';
import { searchDevelopers, getDevelopers } from '../data/products';
import { Developer } from '../types/product';

const Search: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in as a client to find developers');
      navigate('/login', { state: { returnTo: '/search' } });
      return;
    }

    if (isAuthenticated && userType !== 'client') {
      toast.error('Only clients can search for developers');
      navigate('/');
    }
    
    if (query) {
      setDevelopers(searchDevelopers(query));
    } else if (categoryId) {
      setDevelopers(getDevelopers().filter(dev => dev.category === categoryId));
    } else {
      setDevelopers(getDevelopers());
    }
  }, [isAuthenticated, userType, navigate, query, categoryId]);

  if (!isAuthenticated || userType !== 'client') {
    return null;
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
          <SearchBar initialValue={query} />
        </div>

        <CategoryList categories={categories} />
        
        <div className="mt-12">
          <ProductGrid products={developers} />
        </div>
      </div>
    </Layout>
  );
};

export default Search;
