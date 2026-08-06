import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, role }) {
  const { user, loading, refreshUser } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading && retryCount < 3) {
          console.log('⚠️ Loading timeout, attempting refresh...');
          refreshUser();
          setRetryCount(prev => prev + 1);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, retryCount, refreshUser]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.warn('⚠️ Force showing content after timeout');
        setForceShow(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading && !forceShow) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #C5A55A',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#4A2810', fontFamily: 'Playfair Display, serif' }}>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  if (!user) {
    console.log('🔴 No user, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    console.log('🔴 Wrong role, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  return children;
}