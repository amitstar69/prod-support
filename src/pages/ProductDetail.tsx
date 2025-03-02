
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProductGrid from '../components/ProductGrid';
import { getProductById, getProductsByCategory, products } from '../data/products';
import { getCategoryById } from '../data/categories';
import { Heart, ShoppingBag, Star, ChevronRight, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Product } from '../types/product';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      const foundProduct = getProductById(id);
      setProduct(foundProduct);
      
      if (foundProduct) {
        // Get related products from same category, excluding current product
        const related = getProductsByCategory(foundProduct.category)
          .filter(p => p.id !== id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
      
      setIsLoading(false);
      
      // Scroll to top when product changes
      window.scrollTo(0, 0);
    }
  }, [id]);
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  
  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const categoryName = product ? 
    getCategoryById(product.category)?.name || 
    product.category.charAt(0).toUpperCase() + product.category.slice(1) : 
    '';
  
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse rounded-md bg-muted w-12 h-12"></div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="heading-2 mb-4">Product Not Found</h1>
          <p className="body-text mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="button-primary">
            Return to Home
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 mx-2 text-muted-foreground/70" />
            <Link to={`/search?category=${product.category}`} className="text-muted-foreground hover:text-foreground">
              {categoryName}
            </Link>
            <ChevronRight className="w-3 h-3 mx-2 text-muted-foreground/70" />
            <span className="text-foreground font-medium">
              {product.name}
            </span>
          </nav>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative overflow-hidden rounded-xl bg-white">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full object-cover aspect-square md:aspect-auto md:h-[500px] lg:h-[600px]"
            />
          </div>
          
          {/* Product Details */}
          <div className="flex flex-col py-2">
            <Link to={`/search?category=${product.category}`} className="inline-block mb-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {categoryName}
              </span>
            </Link>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              {product.name}
            </h1>
            
            <div className="flex items-center mb-4">
              <div className="flex items-center text-amber-500 mr-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'fill-none'}`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-foreground">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            </div>
            
            <p className="text-2xl font-bold mb-6">
              ${product.hourlyRate.toFixed(2)}/hr
            </p>
            
            <div className="mb-8">
              <p className="body-text">
                {product.description}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </label>
                <div className="flex items-center w-36">
                  <button 
                    onClick={handleDecreaseQuantity}
                    className="h-10 w-10 flex items-center justify-center border border-r-0 border-border rounded-l-md bg-secondary hover:bg-muted transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    readOnly
                    className="h-10 w-16 border-y border-border text-center focus:outline-none [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  
                  <button 
                    onClick={handleIncreaseQuantity}
                    className="h-10 w-10 flex items-center justify-center border border-l-0 border-border rounded-r-md bg-secondary hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className="button-primary py-3 flex-1 gap-2">
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </button>
              
              <button className="button-secondary py-3 flex-1 gap-2">
                <Heart className="h-5 w-5" />
                Add to Wishlist
              </button>
            </div>
            
            <div className="mt-auto pt-6 border-t border-border/40">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Premium Quality</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Free Shipping</p>
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="heading-3 mb-8">You might also like</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
