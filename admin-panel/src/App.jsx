import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import DailyUpdatePage from './pages/DailyUpdatePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import StallPage from './pages/StallPage';
import SalesPage from './pages/SalesPage';
import StockPage from './pages/StockPage';
import ProductionPage from './pages/ProductionPage';
import InvestmentPage from './pages/InvestmentPage';
import CustomersPage from './pages/CustomersPage';
import EnquiriesPage from './pages/EnquiriesPage';
import ReportsPage from './pages/ReportsPage';
import ExportPage from './pages/ExportPage';
import AdminLayout from './components/AdminLayout';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/stall" element={<ProtectedRoute><AdminLayout><StallPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><AdminLayout><SalesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute><AdminLayout><StockPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/production" element={<ProtectedRoute><AdminLayout><ProductionPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/investment" element={<ProtectedRoute><AdminLayout><InvestmentPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><AdminLayout><CustomersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/enquiries" element={<ProtectedRoute><AdminLayout><EnquiriesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><AdminLayout><ProductsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><AdminLayout><CategoriesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/daily-update" element={<ProtectedRoute><AdminLayout><DailyUpdatePage /></AdminLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AdminLayout><ReportsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/export" element={<ProtectedRoute><AdminLayout><ExportPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AdminLayout><AnalyticsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
