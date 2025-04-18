
import React from 'react';
import Layout from '../components/Layout';
import ClientTicketList from '../components/dashboard/ClientTicketList';

const ClientTicketsView: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">My Tickets</h1>
        <ClientTicketList />
      </div>
    </Layout>
  );
};

export default ClientTicketsView;
