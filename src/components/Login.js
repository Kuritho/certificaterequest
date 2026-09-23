// src/components/Login.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import churchLogo from '../assets/images/church-logo.jpg';

// Elegant inline SVG icons
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email.trim(), password.trim());

      if (success) {
        setTimeout(() => {
          const storedUser = JSON.parse(localStorage.getItem('sacramental_user'));
          if (storedUser?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        }, 500);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetMessage(`Error: ${error.message}`);
      } else {
        setResetMessage('✅ Password reset link sent! Check your email.');
        setResetEmail('');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setResetMessage('Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const LogoBlock = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
      <div style={{
        width: '84px',
        height: '84px',
        borderRadius: '50%',
        padding: '3px',
        background: 'linear-gradient(135deg, #C9A961 0%, #DCC28A 50%, #C9A961 100%)',
        boxShadow: '0 8px 32px rgba(201, 169, 97, 0.35), 0 0 0 1px rgba(201, 169, 97, 0.2)'
      }}>
        <img
          src={churchLogo}
          alt="Church Logo"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            background: '#FDFCF8'
          }}
        />
      </div>
    </div>
  );

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <form onSubmit={handleForgotPassword} className="auth-form">
          <LogoBlock />

          <h2>Reset Password</h2>
          <p className="subtitle">Enter your email to receive a reset link</p>

          {resetMessage && (
            <p className={resetMessage.includes('✅') ? 'success' : 'error'}>
              {resetMessage}
            </p>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            disabled={resetLoading}
            autoComplete="email"
          />

          <button type="submit" disabled={resetLoading}>
            {resetLoading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p>
            Remember your password?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setShowForgotPassword(false);
                setResetMessage('');
              }}
            >
              Back to Login
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <LogoBlock />

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to access sacramental records</p>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoComplete="email"
        />

        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        <div className="forgot-password-link">
          <button
            type="button"
            className="link-button"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}