import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiHome, FiFileText, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { FaChurch } from 'react-icons/fa';
import churchLogo from '../assets/images/church-logo.jpg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>
          <div className="logo-icon">
            <img 
              src={churchLogo} 
              alt="Church Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
          </div>
          <div className="brand-copy">
            <strong>Our Lady of Fatima</strong>
            <span>Sacramental Records</span>
          </div>
        </Link>
      </div>

      <div className="sidebar-links">
        {user?.role === 'user' && (
          <>
            <Link to="/user/dashboard"><FiHome /> Dashboard</Link>
            <Link to="/user/request"><FiFileText /> Request Certificate</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/dashboard"><FiHome /> Dashboard</Link>
            <Link to="/admin/review"><FiCheckCircle /> Review Requests</Link>
            <Link to="/admin/post"><FaChurch /> Post Announcement</Link>
            <Link to="/admin/reports"><FiBarChart2 /> Reports</Link>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">👤 {user?.name || 'Guest'}</div>
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
}