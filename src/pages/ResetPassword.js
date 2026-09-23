import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash.
    // The client library automatically picks it up and creates a session.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        // Listen for the auth state change that happens when the token is processed
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setSessionReady(true);
          }
        });
        return () => subscription.unsubscribe();
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        alert('✅ Password updated successfully! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <p>Verifying your reset link...</p>
          <p>If this page doesn't change, your link may have expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Set New Password</h2>
        <p className="subtitle">Enter your new password below</p>
        {error && <p className="error">{error}</p>}
        <div className="password-input-wrapper">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="password-input-wrapper">
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}