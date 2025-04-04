
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';
import CategoryList from '../components/CategoryList';
import { useAuth } from '../contexts/auth';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const Search: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();

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
          <SearchBar />
        </div>

        <CategoryList />
        
        <div className="mt-12">
          <ProductGrid />
        </div>
      </div>
    </Layout>
  );
};

export default Search;
