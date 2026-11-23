import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { Terms } from '@/pages/Terms';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    // Ensure dark mode class is applied to root
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        {/* Redirect any legacy admin paths to home page */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/users" element={<Navigate to="/" replace />} />
        <Route path="/withdrawals" element={<Navigate to="/" replace />} />
        <Route path="/questions" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
