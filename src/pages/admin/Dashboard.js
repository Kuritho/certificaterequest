// src/pages/admin/Dashboard.js
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { dataService } from '../../services/dataService';

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading admin dashboard data...');
      
      const [ann, ev, req] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('certificate_requests').select('*').order('created_at', { ascending: false })
      ]);

      if (ann.error) throw new Error('Failed to load announcements: ' + ann.error.message);
      if (ev.error) throw new Error('Failed to load events: ' + ev.error.message);
      if (req.error) throw new Error('Failed to load requests: ' + req.error.message);

      setAnnouncements(ann.data || []);
      setEvents(ev.data || []);
      setPendingRequests((req.data || []).filter(r => r.status === 'pending'));
      setTotalRequests((req.data || []).length);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError(error.message);
      setAnnouncements([]);
      setEvents([]);
      setPendingRequests([]);
      setTotalRequests(0);
    } finally {
      setLoading(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await dataService.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      alert('✅ Announcement deleted successfully!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('❌ Failed to delete announcement: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await dataService.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      alert('✅ Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('❌ Failed to delete event: ' + error.message);
    } finally {
      setDeleteLoading(false);
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

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="page-subtitle">Manage requests, announcements, and parish events in one centralized panel.</p>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="dashboard-card">
          <h3>Pending Reviews</h3>
          <p>{pendingRequests.length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Requests</h3>
          <p>{totalRequests}</p>
        </div>
        <div className="dashboard-card">
          <h3>Announcements</h3>
          <p>{announcements.length}</p>
        </div>
        <div className="dashboard-card">
          <h3>Upcoming Events</h3>
          <p>{events.length}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h3>Announcements</h3>
          <span>{announcements.length} items</span>
        </div>
        <div className="section-grid">
          {announcements.length === 0 && <p>No announcements available.</p>}
          {announcements.map((a) => (
            <article key={a.id} className="dashboard-card small-card" style={{ position: 'relative' }}>
              <strong>{a.title}</strong>
              <p>{a.content}</p>
              <small>{format(new Date(a.created_at), 'MMM dd, yyyy')}</small>
              <button
                onClick={() => handleDeleteAnnouncement(a.id)}
                disabled={deleteLoading}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#8B1A1A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: deleteLoading ? 0.5 : 1
                }}
              >
                ✕ Delete
              </button>
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
            <article key={e.id} className="dashboard-card small-card" style={{ position: 'relative' }}>
              <strong>{e.title}</strong>
              <p>{e.date} · {e.time}</p>
              <button
                onClick={() => handleDeleteEvent(e.id)}
                disabled={deleteLoading}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#8B1A1A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: deleteLoading ? 0.5 : 1
                }}
              >
                ✕ Delete
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h3>Pending Requests</h3>
          <span>{pendingRequests.length} open</span>
        </div>
        <div className="section-grid">
          {pendingRequests.length === 0 && <p>All requests are up to date.</p>}
          {pendingRequests.map((r) => (
            <article key={r.id} className="dashboard-card small-card">
              <strong>#{r.id} {r.certificate_type}</strong>
              <p>{r.user_name || 'Requester not found'}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}