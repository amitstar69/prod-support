
import { Route } from 'react-router-dom';
import Index from '../pages/Index';
import Search from '../pages/Search';
import ProductDetail from '../pages/ProductDetail';
import DeveloperProfilePage from '../pages/DeveloperProfilePage';
import DeveloperRegistration from '../pages/DeveloperRegistration';

export const publicRoutes = [
  <Route key="home" path="/" element={<Index />} />,
  <Route key="search" path="/search" element={<Search />} />,
  <Route key="product" path="/product/:id" element={<ProductDetail />} />,
  <Route key="developer-profile" path="/developer-profiles/:id" element={<DeveloperProfilePage />} />,
  <Route key="developer-registration" path="/developer-registration" element={<DeveloperRegistration />} />
];
