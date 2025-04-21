
import React from 'react';
import Layout from '../components/Layout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to ProdSupport</h1>
        <p className="mb-4">
          On-demand developer support when you need it most
        </p>
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
            <p className="text-muted-foreground mb-4">
              Connect with expert developers to solve your technical issues quickly.
            </p>
            <a 
              href="/help-request"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Submit a Help Request
            </a>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Are You a Developer?</h2>
            <p className="text-muted-foreground mb-4">
              Join our platform to help clients and earn money.
            </p>
            <a 
              href="/register"
              className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              Join as Developer
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
