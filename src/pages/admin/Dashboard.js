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

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
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

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #C5A55A', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '15px', color: '#4A2810' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#8B1A1A' }}>Error loading dashboard: {error}</p>
        <button onClick={loadData} style={{ marginTop: '10px', padding: '8px 20px', background: '#C5A55A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="page-subtitle">Manage requests, announcements, and parish events.</p>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="dashboard-card"><h3>Pending Reviews</h3><p>{pendingRequests.length}</p></div>
        <div className="dashboard-card"><h3>Total Requests</h3><p>{totalRequests}</p></div>
        <div className="dashboard-card"><h3>Announcements</h3><p>{announcements.length}</p></div>
        <div className="dashboard-card"><h3>Upcoming Events</h3><p>{events.length}</p></div>
      </div>

      <section className="dashboard-section">
        <div className="section-header"><h3>Announcements</h3><span>{announcements.length} items</span></div>
        <div className="section-grid">
          {announcements.length === 0 && <p>No announcements available.</p>}
          {announcements.map((a) => (
            <div key={a.id} className="announcement-card">
              <div className="announcement-content">
                <strong className="announcement-title">{a.title}</strong>
                <p className="announcement-text">{a.content}</p>
                <small className="announcement-date">{format(new Date(a.created_at), 'MMM dd, yyyy')}</small>
              </div>
              <button onClick={() => handleDeleteAnnouncement(a.id)} disabled={deleteLoading} className="delete-btn">✕</button>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header"><h3>Upcoming Events</h3><span>{events.length} events</span></div>
        <div className="section-grid">
          {events.length === 0 && <p>No upcoming events.</p>}
          {events.map((e) => (
            <div key={e.id} className="event-card">
              <div className="event-content">
                <strong className="event-title">{e.title}</strong>
                <p className="event-datetime">{e.date} · {e.time}</p>
              </div>
              <button onClick={() => handleDeleteEvent(e.id)} disabled={deleteLoading} className="delete-btn">✕</button>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header"><h3>Pending Requests</h3><span>{pendingRequests.length} open</span></div>
        <div className="section-grid">
          {pendingRequests.length === 0 && <p>All requests are up to date.</p>}
          {pendingRequests.map((r) => (
            <div key={r.id} className="request-card">
              <strong className="request-id">#{r.id}</strong>
              <span className="request-type">{r.certificate_type}</span>
              <span className="request-user">{r.user_name || 'Requester not found'}</span>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .announcement-card { background: var(--off-white, #FDFBF7); padding: 1rem 1.25rem; border-radius: 10px; border: 1px solid rgba(197, 165, 90, 0.2); transition: all 0.3s ease; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .announcement-card:hover { box-shadow: 0 4px 20px rgba(74, 40, 16, 0.08); }
        .announcement-content { flex: 1; min-width: 0; }
        .announcement-title { display: block; color: var(--brown-dark, #4A2810); font-size: 1rem; margin-bottom: 0.25rem; word-wrap: break-word; }
        .announcement-text { color: var(--brown-light, #7A4A2A); font-size: 0.9rem; line-height: 1.5; margin: 0.25rem 0 0.5rem 0; word-wrap: break-word; overflow-wrap: break-word; max-height: 80px; overflow-y: auto; }
        .announcement-date { color: var(--brown-light, #7A4A2A); font-size: 0.75rem; opacity: 0.7; }
        .event-card { background: var(--off-white, #FDFBF7); padding: 1rem 1.25rem; border-radius: 10px; border: 1px solid rgba(197, 165, 90, 0.2); transition: all 0.3s ease; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
        .event-card:hover { box-shadow: 0 4px 20px rgba(74, 40, 16, 0.08); }
        .event-content { flex: 1; min-width: 0; }
        .event-title { display: block; color: var(--brown-dark, #4A2810); font-size: 1rem; word-wrap: break-word; }
        .event-datetime { color: var(--brown-light, #7A4A2A); font-size: 0.85rem; margin-top: 0.15rem; }
        .request-card { background: var(--off-white, #FDFBF7); padding: 1rem 1.25rem; border-radius: 10px; border: 1px solid rgba(197, 165, 90, 0.2); display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .request-id { color: var(--gold-dark, #B8943C); font-weight: 700; font-size: 0.9rem; }
        .request-type { background: rgba(197, 165, 90, 0.15); color: var(--gold-dark, #B8943C); padding: 0.15rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .request-user { color: var(--brown-dark, #4A2810); font-size: 0.9rem; margin-left: auto; }
        .delete-btn { background: rgba(139, 26, 26, 0.08); color: #8B1A1A; border: none; border-radius: 6px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.85rem; transition: all 0.2s ease; flex-shrink: 0; line-height: 1.5; }
        .delete-btn:hover { background: #8B1A1A; color: #fff; }
        .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) { .announcement-card { flex-direction: column; } .delete-btn { align-self: flex-end; } .request-card { flex-wrap: wrap; } .request-user { margin-left: 0; width: 100%; } }
      `}</style>
    </div>
  );
}