
import { Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import VerificationSuccessPage from '../pages/VerificationSuccessPage';
import VerificationCanceledPage from '../pages/VerificationCanceledPage';

export const authRoutes = [
  <Route key="login" path="/login" element={<LoginPage />} />,
  <Route key="register" path="/register" element={<RegisterPage />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPasswordPage />} />,
  <Route key="reset-password" path="/reset-password" element={<ResetPasswordPage />} />,
  <Route key="verification-success" path="/verification-success" element={<VerificationSuccessPage />} />,
  <Route key="verification-canceled" path="/verification-canceled" element={<VerificationCanceledPage />} />
];
