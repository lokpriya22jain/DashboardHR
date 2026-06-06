import './index.css';
import React from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { token } = useAuth();

  // Route Guard: If no token exists, lock workspace and show login panel
  if (!token) {
    return <Login />;
  }

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