import './index.css';
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { token } = useAuth();
  // State to handle switching between Login and Signup pages locally
  const [isLoginView, setIsLoginView] = useState(true);

  // Gateway Route Guard: If no valid token exists, restrict access to the dashboard
  if (!token) {
    return isLoginView ? (
      <Login switchToSignup={() => setIsLoginView(false)} />
    ) : (
      <Signup switchToLogin={() => setIsLoginView(true)} />
    );
  }

  // Granted Access: Mount complete multi-tab layout directory system
  return (
    <div className="app-container">
      <Dashboard />
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