import { Routes, Route } from 'react-router-dom';
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

import './App.css';

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
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
