import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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

import './App.css';

/* Route guard: requires login */
function ProtectedRoute({ children }) {
  const { state } = useApp();
  if (!state?.user) return <Navigate to="/login" replace />;
  return children;
}

/* Route guard: only for guests (not logged in) */
function GuestRoute({ children }) {
  const { state } = useApp();
  if (state?.user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/prompt/:id" element={<PromptDetailPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
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
