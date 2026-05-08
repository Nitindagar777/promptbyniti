import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import TemplatesPage from './pages/TemplatesPage';
import LibraryPage from './pages/LibraryPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import PromptDetailPage from './pages/PromptDetailPage';
import SellPage from './pages/SellPage';
import BuyerDashboard from './pages/BuyerDashboard';
import PurchaseSuccess from './pages/PurchaseSuccess';
import AdminTestLab from './pages/AdminTestLab';

import './App.css';

/* Route guard: requires login */
function ProtectedRoute({ children }) {
  const { state, authLoading } = useApp();
  
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="loader-premium"></div>
        <p>Verifying Session...</p>
      </div>
    );
  }

  if (!state?.user) return <Navigate to="/login" replace />;
  return children;
}

/* Route guard: admin only */
function AdminRoute({ children }) {
  const { state, authLoading } = useApp();
  const ADMIN_EMAIL = 'nitindagar0800@gmail.com';

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="loader-premium"></div>
        <p>Verifying Session...</p>
      </div>
    );
  }

  if (!state?.user) return <Navigate to="/login" replace />;
  if (state.user.email?.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/* Route guard: only for guests (not logged in) */
function GuestRoute({ children }) {
  const { state, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="loader-premium"></div>
      </div>
    );
  }

  if (state?.user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="app">
        <ScrollToTop />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
            <Route path="/prompt/:id" element={<PromptDetailPage />} />
            <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/buyer-dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/admin-lab" element={<AdminRoute><AdminTestLab /></AdminRoute>} />
            <Route path="/purchase-success/:id" element={<ProtectedRoute><PurchaseSuccess /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/login" element={<GuestRoute><AuthPage initialMode="login" /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><AuthPage initialMode="signup" /></GuestRoute>} />
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', marginBottom: '20px' }}>404</h1>
                <p style={{ color: 'var(--text-secondary)'}}>Page not found. The AI couldn't generate this route.</p>
              </div>
            } />
          </Routes>
        </main>
      <Footer />
    </div>
  );
}

export default App;
