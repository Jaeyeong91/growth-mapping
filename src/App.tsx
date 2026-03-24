import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookingProvider, useBooking } from './contexts/BookingContext';
import { MappingProvider } from './contexts/MappingContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import MentorDashboard from './pages/MentorDashboard';
import MentorSchedule from './pages/MentorSchedule';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyMentorView from './pages/CompanyMentorView';
import AdminDashboard from './pages/AdminDashboard';
import AdminAccounts from './pages/AdminAccounts';
import AdminMentorSchedule from './pages/AdminMentorSchedule';
import { ReactNode } from 'react';
import { Role } from './types';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#FF5E27] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading: authLoading } = useAuth();
  const { loading: bookingLoading } = useBooking();

  if (authLoading || bookingLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mentor" element={<ProtectedRoute allowedRole="mentor"><MentorDashboard /></ProtectedRoute>} />
      <Route path="/mentor/schedule" element={<ProtectedRoute allowedRole="mentor"><MentorSchedule /></ProtectedRoute>} />
      <Route path="/company" element={<ProtectedRoute allowedRole="company"><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/mentor/:id" element={<ProtectedRoute allowedRole="company"><CompanyMentorView /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/accounts" element={<ProtectedRoute allowedRole="admin"><AdminAccounts /></ProtectedRoute>} />
      <Route path="/admin/mentor/:id" element={<ProtectedRoute allowedRole="admin"><AdminMentorSchedule /></ProtectedRoute>} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function ProtectedRoute({ children, allowedRole }: { children: ReactNode; allowedRole: Role }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== allowedRole) return <Navigate to={`/${currentUser.role === 'company' ? 'company' : currentUser.role}`} replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  const routes = { mentor: '/mentor', company: '/company', admin: '/admin' };
  return <Navigate to={routes[currentUser.role]} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <MappingProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </MappingProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
