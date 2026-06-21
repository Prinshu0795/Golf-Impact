import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ToastContainer from './components/ui/ToastContainer';
import FloatingThemeToggle from './components/FloatingThemeToggle';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/RouteGuards';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CharityListPage from './pages/CharityListPage';
import CharityProfilePage from './pages/CharityProfilePage';
import SupportPage from './pages/SupportPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ScoresPage from './pages/dashboard/ScoresPage';
import SubscriptionPage from './pages/dashboard/SubscriptionPage';
import CharityPage from './pages/dashboard/CharityPage';
import RewardsPage from './pages/dashboard/RewardsPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDraw from './pages/admin/AdminDraw';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';
import AdminSupport from './pages/admin/AdminSupport';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <ToastProvider>
              <ToastContainer />
              <FloatingThemeToggle />
              <Routes>
                {/* Public routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/charities" element={<CharityListPage />} />
                  <Route path="/charities/:id" element={<CharityProfilePage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                  <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
                  <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                  <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                </Route>

                {/* Dashboard routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardPage />} />
                  <Route path="scores" element={<ScoresPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path="charity" element={<CharityPage />} />
                  <Route path="rewards" element={<RewardsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Admin routes */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="draws" element={<AdminDraw />} />
                  <Route path="charities" element={<AdminCharities />} />
                  <Route path="winners" element={<AdminWinners />} />
                  <Route path="support" element={<AdminSupport />} />
                </Route>
              </Routes>
            </ToastProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
