
import React from 'react';
import { useNavigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import HelpRequestForm from '../components/help/HelpRequestForm';
import HelpRequestSuccess from '../components/help/HelpRequestSuccess';
import { ArrowLeft } from 'lucide-react';

const GetHelpPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="bg-secondary/30 py-10">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm mb-6 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          
          <h1 className="heading-2 mb-2">Get Developer Help</h1>
          <p className="text-muted-foreground">
            Describe your technical issue and get matched with skilled developers
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Routes>
          <Route index element={<HelpRequestForm />} />
          <Route path="success" element={<HelpRequestSuccess />} />
        </Routes>
      </div>
    </Layout>
  );
};

export default GetHelpPage;
