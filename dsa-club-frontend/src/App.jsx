import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/shared/ProtectedRoute/ProtectedRoute';
import Toast from './components/shared/Toast/Toast';

// pages — imported as needed
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import OAuthSuccess from './pages/Auth/OAuthSuccess';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AddProblemPage from './pages/Problem/AddProblemPage';
import SessionPage from './pages/Session/SessionPage';
import InterviewPage from './pages/Interview/InterviewPage';
import ResultPage from './pages/Result/ResultPage';
import HistoryPage from './pages/History/HistoryPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Toast />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/success" element={<OAuthSuccess />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/problems/new" element={
              <ProtectedRoute><AddProblemPage /></ProtectedRoute>
            } />
            <Route path="/sessions/:id" element={
              <ProtectedRoute><SessionPage /></ProtectedRoute>
            } />
            <Route path="/sessions/:id/interview" element={
              <ProtectedRoute><InterviewPage /></ProtectedRoute>
            } />
            <Route path="/sessions/:id/result" element={
              <ProtectedRoute><ResultPage /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><HistoryPage /></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;