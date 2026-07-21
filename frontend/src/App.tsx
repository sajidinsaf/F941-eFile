import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import DashboardPage from '@/pages/DashboardPage';
import BusinessProfilePage from '@/pages/BusinessProfilePage';
import NewFilingPage from '@/pages/NewFilingPage';
import Form941Page from '@/pages/Form941Page';
import PaymentPage from '@/pages/PaymentPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<BusinessProfilePage />} />
          <Route path="/filings/new" element={<NewFilingPage />} />
          <Route path="/filings/:id/form941" element={<Form941Page />} />
          <Route path="/filings/:id/payment" element={<PaymentPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
