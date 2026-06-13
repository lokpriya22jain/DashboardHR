import './index.css';
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AttendanceManager from './pages/AttendanceManager';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { token } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  // This state will track exactly which screen to show on the main panel
  // Options: 'analytics' or 'attendance'
  const [currentTab, setCurrentTab] = useState('analytics');

  // 🔒 Guard: Show login/signup if not logged in
  if (!token) {
    return isLoginView ? (
      <Login switchToSignup={() => setIsLoginView(false)} />
    ) : (
      <Signup switchToLogin={() => setIsLoginView(true)} />
    );
  }

  // 🔓 Granted Access: Pass the tab state down to Dashboard
  return (
    <div className="app-container">
      <Dashboard currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;