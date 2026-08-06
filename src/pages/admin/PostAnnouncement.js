import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dataService } from '../../services/dataService';
import { format } from 'date-fns';

export default function PostAnnouncement() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState({ title: '', content: '' });
  const [event, setEvent] = useState({ title: '', date: '', time: '' });
  const [tab, setTab] = useState('announcement');
  const [loading, setLoading] = useState(false);
  const [existingAnnouncements, setExistingAnnouncements] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const [ann, ev] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true })
      ]);
      if (ann.data) setExistingAnnouncements(ann.data);
      if (ev.data) setExistingEvents(ev.data);
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const postAnnouncement = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('announcements').insert([{ title: announcement.title, content: announcement.content, user_id: user.id }]);
      setAnnouncement({ title: '', content: '' });
      await loadExistingData();
      alert('✅ Announcement posted successfully!');
    } catch (error) {
      console.error('Error posting announcement:', error);
      alert('❌ Error posting announcement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const postEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('events').insert([{ title: event.title, date: event.date, time: event.time, user_id: user.id }]);
      setEvent({ title: '', date: '', time: '' });
      await loadExistingData();
      alert('✅ Event posted successfully!');
    } catch (error) {
      console.error('Error posting event:', error);
      alert('❌ Error posting event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await dataService.deleteAnnouncement(id);
      await loadExistingData();
      alert('✅ Announcement deleted');
    } catch (error) {
      alert('❌ Error deleting: ' + error.message);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await dataService.deleteEvent(id);
      await loadExistingData();
      alert('✅ Event deleted');
    } catch (error) {
      alert('❌ Error deleting: ' + error.message);
    }
  };

  return (
    <div className="post-page">
      <h2>Post Announcements & Events</h2>
      
      <div className="tabs">
        <button onClick={() => setTab('announcement')} className={tab === 'announcement' ? 'active' : ''}>📢 Announcement</button>
        <button onClick={() => setTab('event')} className={tab === 'event' ? 'active' : ''}>📅 Event</button>
      </div>

      {tab === 'announcement' && (
        <>
          <form onSubmit={postAnnouncement} className="post-form">
            <div className="form-group"><label>Title *</label><input value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} required disabled={loading} /></div>
            <div className="form-group"><label>Content *</label><textarea value={announcement.content} onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })} required disabled={loading} rows="4" /></div>
            <button type="submit" disabled={loading}>{loading ? 'Posting...' : '📢 Post Announcement'}</button>
          </form>

          {existingAnnouncements.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Existing Announcements</h3>
              <div className="section-grid">
                {existingAnnouncements.map(a => (
                  <div key={a.id} className="small-card" style={{ position: 'relative' }}>
                    <strong>{a.title}</strong><p>{a.content}</p><small>{format(new Date(a.created_at), 'MMM dd, yyyy')}</small>
                    <button onClick={() => deleteAnnouncement(a.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>✕ Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'event' && (
        <>
          <form onSubmit={postEvent} className="post-form">
            <div className="form-group"><label>Event Title *</label><input value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} required disabled={loading} /></div>
            <div className="form-group"><label>Date *</label><input type="date" value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} required disabled={loading} /></div>
            <div className="form-group"><label>Time *</label><input type="time" value={event.time} onChange={(e) => setEvent({ ...event, time: e.target.value })} required disabled={loading} /></div>
            <button type="submit" disabled={loading}>{loading ? 'Posting...' : '📅 Post Event'}</button>
          </form>

          {existingEvents.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Existing Events</h3>
              <div className="section-grid">
                {existingEvents.map(e => (
                  <div key={e.id} className="small-card" style={{ position: 'relative' }}>
                    <strong>{e.title}</strong><p>{e.date} · {e.time}</p>
                    <button onClick={() => deleteEvent(e.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>✕ Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}