
import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import FeaturedSection from '../components/FeaturedSection';
import CategoryList from '../components/CategoryList';
import { getFeaturedProducts } from '../data/products';
import { categories } from '../data/categories';

const Index: React.FC = () => {
  const featuredProducts = getFeaturedProducts();
  
  return (
    <Layout>
      <Hero />
      
      <FeaturedSection 
        title="Featured Products"
        description="Discover our collection of premium products designed with exceptional attention to detail."
        products={featuredProducts}
        viewAllLink="/search"
      />
      
      <section className="py-12 md:py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="heading-2 mb-2">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl">
              Browse our carefully curated categories to find what you're looking for.
            </p>
          </div>
          
          <CategoryList categories={categories} />
        </div>
      </section>
      
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(120,180,250,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-2 mb-6">Experience the difference of premium quality products</h2>
            <p className="body-text mb-8 mx-auto max-w-2xl">
              Our marketplace offers a curated selection of high-quality products designed to enhance your everyday life. Join thousands of satisfied customers who have discovered the perfect products for their needs.
            </p>
            <a href="/search" className="button-primary">
              Start Shopping
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
