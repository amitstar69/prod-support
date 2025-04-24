
import React from 'react';
import Layout from '../components/Layout';

const TicketsPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">All Tickets</h1>
        <p>View and manage your tickets here.</p>
        {/* Ticket list would go here */}
      </div>
    </Layout>
  );
};

export default TicketsPage;
