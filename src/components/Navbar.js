// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiHome, FiFileText, FiCheckCircle, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';
import { FaChurch } from 'react-icons/fa';
import churchLogo from '../assets/images/church-logo.jpg';
import ConfirmModal from './ConfirmModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setMobileMenuOpen(false);
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setShowLogoutConfirm(false);
    } finally {
      setLoggingOut(false);
    }
  };

  const cancelLogout = () => {
    if (loggingOut) return;
    setShowLogoutConfirm(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Link
            to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
            onClick={closeMenu}
          >
            <div className="logo-icon">
              <img
                src={churchLogo}
                alt="Church Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div className="brand-copy">
              <strong>Our Lady of Fatima</strong>
              <span>Sacramental Records</span>
            </div>
          </Link>

          {/* Hamburger button — visible only on mobile via CSS */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <div className="sidebar-links">
          {user?.role === 'user' && (
            <>
              <Link to="/user/dashboard" onClick={closeMenu}>
                <FiHome /> Dashboard
              </Link>
              <Link to="/user/request" onClick={closeMenu}>
                <FiFileText /> Request Certificate
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" onClick={closeMenu}>
                <FiHome /> Dashboard
              </Link>
              <Link to="/admin/review" onClick={closeMenu}>
                <FiCheckCircle /> Review Requests
              </Link>
              <Link to="/admin/post" onClick={closeMenu}>
                <FaChurch /> Post Announcement
              </Link>
              <Link to="/admin/reports" onClick={closeMenu}>
                <FiBarChart2 /> Reports
              </Link>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">👤 {user?.name || 'Guest'}</div>
          <button onClick={handleLogoutClick} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* ===== LOGOUT CONFIRMATION MODAL ===== */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Sign out of your account?"
        message={`You'll need to enter your email and password again to access your ${
          user?.role === 'admin' ? 'administrative tools' : 'certificate requests'
        }.`}
        confirmLabel="Sign Out"
        cancelLabel="Stay Signed In"
        variant="warning"
        icon="shield"
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}