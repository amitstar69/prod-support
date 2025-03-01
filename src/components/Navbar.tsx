
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-background/80 backdrop-blur-md shadow-sm' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xl md:text-2xl font-bold transition-transform hover:scale-105"
          >
            marketplace
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-foreground/80 hover:text-foreground font-medium"
              >
                Home
              </Link>
              <Link 
                to="/search" 
                className="text-foreground/80 hover:text-foreground font-medium"
              >
                Shop
              </Link>
              <Link 
                to="/categories" 
                className="text-foreground/80 hover:text-foreground font-medium"
              >
                Categories
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link 
                to="/search" 
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link 
                to="/profile" 
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="User profile"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link 
                to="/cart" 
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <Link 
              to="/search" 
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              className="p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md shadow-md mt-1 py-4 px-6 md:hidden animate-slide-down">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground/80 hover:text-foreground font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/search" 
                className="text-foreground/80 hover:text-foreground font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/categories" 
                className="text-foreground/80 hover:text-foreground font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <div className="border-t border-border/30 pt-3 mt-2 flex justify-between">
                <Link 
                  to="/profile" 
                  className="flex items-center text-foreground/80 hover:text-foreground font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
                <Link 
                  to="/cart" 
                  className="flex items-center text-foreground/80 hover:text-foreground font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Cart
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
