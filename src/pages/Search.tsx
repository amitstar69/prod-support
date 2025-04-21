
import React from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';

const Search: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search Developers</h1>
        <div className="mb-6">
          <SearchBar />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <p className="text-muted-foreground">
            No search results yet. Try searching for a developer by name or skill.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
