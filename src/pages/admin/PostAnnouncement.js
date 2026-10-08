// src/pages/admin/PostAnnouncement.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { dataService } from '../../services/dataService';
import { format } from 'date-fns';
import ConfirmModal from '../../components/ConfirmModal';

export default function PostAnnouncement() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState({ title: '', content: '' });
  const [event, setEvent] = useState({ title: '', date: '', time: '' });
  const [tab, setTab] = useState('announcement');
  const [loading, setLoading] = useState(false);
  const [existingAnnouncements, setExistingAnnouncements] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);

  // ---- Confirmation modal state ----
  const [confirm, setConfirm] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'primary',
    icon: 'info',
    loading: false,
    onConfirm: null,
    // optional custom body (used for previews)
    customBody: null,
  });

  const openConfirm = (config) =>
    setConfirm({ open: true, loading: false, customBody: null, ...config });

  const closeConfirm = () =>
    setConfirm((prev) => ({ ...prev, open: false, loading: false, customBody: null }));

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const [ann, ev] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true }),
      ]);
      if (ann.data) setExistingAnnouncements(ann.data);
      if (ev.data) setExistingEvents(ev.data);
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  // ---- Step 1: User clicks "Post Announcement" → show confirmation ----
  const handlePostAnnouncement = (e) => {
    e.preventDefault();

    if (!announcement.title.trim() || !announcement.content.trim()) {
      alert('Please fill in both the title and content.');
      return;
    }

    openConfirm({
      title: 'Publish this announcement?',
      message: 'Review the preview below. Once published, all parishioners will see it on their dashboard.',
      confirmLabel: 'Yes, Publish Announcement',
      cancelLabel: 'Go Back & Edit',
      variant: 'primary',
      icon: 'megaphone',
      customBody: (
        <div className="post-preview">
          <div className="post-preview-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l18-8v18l-18-8z" />
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
          </div>
          <h4 className="post-preview-title">{announcement.title}</h4>
          <p className="post-preview-content">{announcement.content}</p>
        </div>
      ),
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        setLoading(true);
        try {
          await supabase.from('announcements').insert([
            {
              title: announcement.title,
              content: announcement.content,
              user_id: user.id,
            },
          ]);
          setAnnouncement({ title: '', content: '' });
          await loadExistingData();
          closeConfirm();
        } catch (error) {
          console.error('Error posting announcement:', error);
          alert('❌ Error posting announcement: ' + error.message);
          closeConfirm();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // ---- Step 1: User clicks "Post Event" → show confirmation ----
  const handlePostEvent = (e) => {
    e.preventDefault();

    if (!event.title.trim() || !event.date || !event.time) {
      alert('Please fill in the event title, date, and time.');
      return;
    }

    // Parse date for prettier display
    const eventDate = new Date(`${event.date}T${event.time}`);
    const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(eventDate, 'h:mm a');

    openConfirm({
      title: 'Publish this event?',
      message: 'Review the preview below. Once published, all parishioners will see this event on their calendar.',
      confirmLabel: 'Yes, Publish Event',
      cancelLabel: 'Go Back & Edit',
      variant: 'primary',
      icon: 'calendar',
      customBody: (
        <div className="post-preview">
          <div className="post-preview-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h4 className="post-preview-title">{event.title}</h4>
          <div className="post-preview-meta">
            <span className="post-preview-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formattedDate}
            </span>
            <span className="post-preview-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {formattedTime}
            </span>
          </div>
        </div>
      ),
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        setLoading(true);
        try {
          await supabase.from('events').insert([
            {
              title: event.title,
              date: event.date,
              time: event.time,
              user_id: user.id,
            },
          ]);
          setEvent({ title: '', date: '', time: '' });
          await loadExistingData();
          closeConfirm();
        } catch (error) {
          console.error('Error posting event:', error);
          alert('❌ Error posting event: ' + error.message);
          closeConfirm();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const deleteAnnouncement = (id, title) => {
    openConfirm({
      title: 'Delete announcement?',
      message: `"${title}" will be permanently removed.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'trash',
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        try {
          await dataService.deleteAnnouncement(id);
          await loadExistingData();
          closeConfirm();
        } catch (error) {
          alert('❌ Error deleting: ' + error.message);
          closeConfirm();
        }
      },
    });
  };

  const deleteEvent = (id, title) => {
    openConfirm({
      title: 'Delete event?',
      message: `"${title}" will be removed from the parish calendar.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'trash',
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        try {
          await dataService.deleteEvent(id);
          await loadExistingData();
          closeConfirm();
        } catch (error) {
          alert('❌ Error deleting: ' + error.message);
          closeConfirm();
        }
      },
    });
  };

  return (
    <div className="post-page">
      <h2>Post Announcements & Events</h2>

      <div className="tabs">
        <button
          onClick={() => setTab('announcement')}
          className={tab === 'announcement' ? 'active' : ''}
        >
          📢 Announcement
        </button>
        <button
          onClick={() => setTab('event')}
          className={tab === 'event' ? 'active' : ''}
        >
          📅 Event
        </button>
      </div>

      {tab === 'announcement' && (
        <>
          <form onSubmit={handlePostAnnouncement} className="post-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                value={announcement.title}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, title: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Content *</label>
              <textarea
                value={announcement.content}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, content: e.target.value })
                }
                required
                disabled={loading}
                rows="4"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Posting...' : '📢 Post Announcement'}
            </button>
          </form>

          {existingAnnouncements.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Existing Announcements</h3>
              <div className="section-grid">
                {existingAnnouncements.map((a) => (
                  <div
                    key={a.id}
                    className="small-card"
                    style={{ position: 'relative' }}
                  >
                    <strong>{a.title}</strong>
                    <p>{a.content}</p>
                    <small>{format(new Date(a.created_at), 'MMM dd, yyyy')}</small>
                    <button
                      onClick={() => deleteAnnouncement(a.id, a.title)}
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
                      }}
                    >
                      ✕ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'event' && (
        <>
          <form onSubmit={handlePostEvent} className="post-form">
            <div className="form-group">
              <label>Event Title *</label>
              <input
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <input
                type="time"
                value={event.time}
                onChange={(e) => setEvent({ ...event, time: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Posting...' : '📅 Post Event'}
            </button>
          </form>

          {existingEvents.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Existing Events</h3>
              <div className="section-grid">
                {existingEvents.map((e) => (
                  <div
                    key={e.id}
                    className="small-card"
                    style={{ position: 'relative' }}
                  >
                    <strong>{e.title}</strong>
                    <p>
                      {e.date} · {e.time}
                    </p>
                    <button
                      onClick={() => deleteEvent(e.id, e.title)}
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
                      }}
                    >
                      ✕ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== CONFIRM MODAL ===== */}
      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        variant={confirm.variant}
        icon={confirm.icon}
        loading={confirm.loading}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
        customBody={confirm.customBody}
      />
    </div>
  );
}