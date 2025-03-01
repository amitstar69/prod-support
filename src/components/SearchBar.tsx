
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className = "", 
  placeholder = "Search for developers...",
  initialValue = ""
}) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 bg-white/80 backdrop-blur-sm shadow-sm transition-all"
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <button type="submit" className="sr-only">Search</button>
    </form>
  );
};

export default SearchBar;
