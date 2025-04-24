
import React from 'react';
import Layout from '../components/Layout';

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome to the admin dashboard.</p>
        {/* Admin dashboard content would go here */}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
