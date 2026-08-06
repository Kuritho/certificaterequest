// src/pages/user/Dashboard.js
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading dashboard data for user:', user.id);
      
      // Load all data in parallel
      const [ann, ev, req, notif] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('certificate_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (ann.error) throw new Error('Failed to load announcements: ' + ann.error.message);
      if (ev.error) throw new Error('Failed to load events: ' + ev.error.message);
      if (req.error) throw new Error('Failed to load requests: ' + req.error.message);
      if (notif.error) throw new Error('Failed to load notifications: ' + notif.error.message);

      setAnnouncements(ann.data || []);
      setEvents(ev.data || []);
      setMyRequests(req.data || []);
      setNotifications(notif.data || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
      // Use fallback data
      setAnnouncements([]);
      setEvents([]);
      setMyRequests([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #C5A55A',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '15px', color: '#4A2810' }}>Loading dashboard...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#8B1A1A' }}>Error loading dashboard: {error}</p>
        <button 
          onClick={loadData}
          style={{
            marginTop: '10px',
            padding: '8px 20px',
            background: '#C5A55A',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingCount = myRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>Welcome, {user?.name || 'User'}!</h2>
          <p className="page-subtitle">Check your request progress, parish updates, and upcoming events at a glance.</p>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="dashboard-card">
          <h3>Total Requests</h3>
          <p>{myRequests.length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Pending</h3>
          <p>{pendingCount}</p>
        </div>
        <div className="dashboard-card">
          <h3>Completed</h3>
          <p>{myRequests.filter((r) => r.status === 'completed').length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Notifications</h3>
          <p>{notifications.length}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h3>Announcements</h3>
          <span>{announcements.length} published</span>
        </div>
        <div className="section-grid">
          {announcements.length === 0 && <p>No announcements available.</p>}
          {announcements.map((a) => (
            <article key={a.id} className="dashboard-card small-card">
              <strong>{a.title}</strong>
              <p>{a.content}</p>
              <small>{format(new Date(a.created_at), 'MMM dd, yyyy')}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h3>Upcoming Events</h3>
          <span>{events.length} events</span>
        </div>
        <div className="section-grid">
          {events.length === 0 && <p>No upcoming events.</p>}
          {events.map((e) => (
            <article key={e.id} className="dashboard-card small-card">
              <strong>{e.title}</strong>
              <p>{e.date} · {e.time}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h3>Recent Notifications</h3>
          <span>{notifications.length} messages</span>
        </div>
        <div className="section-grid">
          {notifications.length === 0 && <p>No notifications yet.</p>}
          {notifications.slice(0, 3).map((n) => (
            <article key={n.id} className="dashboard-card small-card">
              <p>{n.message}</p>
              <small>{format(new Date(n.created_at), 'MMM dd, yyyy HH:mm')}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}