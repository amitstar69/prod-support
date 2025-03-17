
import React from 'react';
import { useNavigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import HelpRequestForm from '../components/help/HelpRequestForm';
import HelpRequestSuccess from '../components/help/HelpRequestSuccess';
import HelpRequestsTracking from '../components/help/HelpRequestsTracking';
import HelpRequestDetail from '../components/help/HelpRequestDetail';
import { ArrowLeft } from 'lucide-react';

const GetHelpPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-12 shadow-md">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm mb-6 text-slate-200 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          
          <Routes>
            <Route path="/" element={
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Get Developer Help</h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                  Describe your technical issue and get matched with skilled developers
                </p>
              </>
            } />
            <Route path="/success" element={
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Request Submitted</h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                  Your help request has been successfully submitted
                </p>
              </>
            } />
            <Route path="/tracking" element={
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Help Request Tracker</h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                  View and manage your submitted help requests
                </p>
              </>
            } />
            <Route path="/request/:requestId" element={
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Help Request Details</h1>
                <p className="text-slate-300 text-lg max-w-2xl">
                  View the details of your help request
                </p>
              </>
            } />
          </Routes>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Routes>
          <Route index element={<HelpRequestForm />} />
          <Route path="success" element={<HelpRequestSuccess />} />
          <Route path="tracking" element={<HelpRequestsTracking />} />
          <Route path="request/:requestId" element={<HelpRequestDetail />} />
        </Routes>
      </div>
    </Layout>
  );
};

export default GetHelpPage;
