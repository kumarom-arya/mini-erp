import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Lock, User, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      const res = await api.post('/auth/seed');
      alert(res.data?.message || 'Users seeded successfully. You can now login with username: admin and password: password123');
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Seeding failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
            animation: 'subtleFloat 3s ease-in-out infinite'
          }}>
            <Lock size={24} color="white" />
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            background: 'linear-gradient(135deg, #f1f5f9, var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mini ERP
          </h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="search-container">
              <User size={16} className="search-icon" />
              <input
                type="text"
                className="form-input search-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-container">
              <Lock size={16} className="search-icon" />
              <input
                type="password"
                className="form-input search-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.85rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spinSlow 1s linear infinite' }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Seed Button */}
        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={handleSeed}
            style={{ fontSize: '0.7rem', padding: '0.4rem 0.75rem', opacity: 0.7 }}
          >
            Initialize Demo Users
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
