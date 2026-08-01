import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>
          <div className="logo-icon">⛪</div>
          <div className="brand-copy">
            <strong>Our Lady of Fatima</strong>
            <span>Sacramental Records</span>
          </div>
        </Link>
      </div>

      <div className="sidebar-links">
        {user?.role === 'user' && (
          <>
            <Link to="/user/dashboard">Dashboard</Link>
            <Link to="/user/request">Request Certificate</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/review">Review Requests</Link>
            <Link to="/admin/post">Post Announcement</Link>
            <Link to="/admin/reports">Reports</Link>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">👤 {user?.name || 'Guest'}</div>
        <button onClick={handleLogout} className="logout-btn"><FiLogOut /> Logout</button>
      </div>
    </aside>
  );
}