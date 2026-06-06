import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (email === 'admin@company.com' && password === 'admin123') {
        // Mock a successful login by manually setting a dummy token in the system
        localStorage.setItem('token', 'mock-development-jwt-token');
        window.location.reload(); // Quick refresh to let App.jsx catch the new token
        return;
      }
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrative credentials');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sign In</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Access your administrative HR workspace.</p>
        
        {error && <div className="error-banner">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="admin@company.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="login-btn">Login to Dashboard</button>
        </form>
      </div>
    </div>
  );
}

export default Login;