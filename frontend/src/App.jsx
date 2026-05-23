import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CampaignManager from './pages/CampaignManager';
import ContentBank from './pages/ContentBank';
import ReferralTracker from './pages/ReferralTracker';
import AIHub from './pages/AIHub';
import Calendar from './pages/Calendar';
import ContentGenerator from './pages/ContentGenerator';
import AIAgentsHub from './pages/AIAgentsHub';
import CommunityIntelligence from './pages/CommunityIntelligence';
import ProtectedRoute from './components/ProtectedRoute';
import PinAuthModal from './components/PinAuthModal';
import Navigation from './components/Navigation';

// A wrapper to handle the inactivity timer
const AppLayout = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  let timeoutId;

  const resetTimer = () => {
    if (isLocked) return;
    clearTimeout(timeoutId);
    // 5 minutes of inactivity locks the session
    timeoutId = setTimeout(() => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLocked(true);
      }
    }, 5 * 60 * 1000); 
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
      clearTimeout(timeoutId);
    };
  }, [isLocked]);

  return (
    <div style={{ display: 'flex' }}>
      <Navigation />
      <main style={{ marginLeft: '18rem', padding: '2rem', width: '100%' }}>
        {children}
      </main>
      {isLocked && <PinAuthModal onVerify={() => setIsLocked(false)} />}
    </div>
  );
};

// Login Route Wrapper so we can use navigate
const LoginWrapper = () => {
  const navigate = useNavigate();
  return <Login onSuccess={() => navigate('/dashboard')} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginWrapper />} />
        
        {/* Protected Routes wrapped in AppLayout */}
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/campaigns"
                  element={
                    <ProtectedRoute>
                      <CampaignManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/content"
                  element={
                    <ProtectedRoute>
                      <ContentBank />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/referrals"
                  element={
                    <ProtectedRoute>
                      <ReferralTracker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/generator"
                  element={
                    <ProtectedRoute>
                      <ContentGenerator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agents"
                  element={
                    <ProtectedRoute>
                      <AIAgentsHub />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <CommunityIntelligence />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai"
                  element={
                    <ProtectedRoute>
                      <AIHub />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
