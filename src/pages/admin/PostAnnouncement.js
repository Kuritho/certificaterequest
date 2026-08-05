import { useState } from 'react';

export default function PostAnnouncement() {
  const [announcement, setAnnouncement] = useState({ title: '', content: '' });
  const [event, setEvent] = useState({ title: '', date: '', time: '' });
  const [tab, setTab] = useState('announcement');

  const postAnnouncement = (e) => {
    e.preventDefault();
    const ann = JSON.parse(localStorage.getItem('sacramental_announcements') || '[]');
    ann.push({ id: Date.now(), ...announcement, date: new Date().toISOString() });
    localStorage.setItem('sacramental_announcements', JSON.stringify(ann));
    setAnnouncement({ title: '', content: '' });
    alert('Announcement posted!');
  };

  const postEvent = (e) => {
    e.preventDefault();
    const ev = JSON.parse(localStorage.getItem('sacramental_events') || '[]');
    ev.push({ id: Date.now(), ...event });
    localStorage.setItem('sacramental_events', JSON.stringify(ev));
    setEvent({ title: '', date: '', time: '' });
    alert('Event posted!');
  };

  return (
    <div className="post-page">
      <h2>Post Announcements & Events</h2>
      <div className="tabs">
        <button onClick={() => setTab('announcement')} className={tab === 'announcement' ? 'active' : ''}>
          Announcement
        </button>
        <button onClick={() => setTab('event')} className={tab === 'event' ? 'active' : ''}>
          Event
        </button>
      </div>

      {tab === 'announcement' && (
        <form onSubmit={postAnnouncement} className="post-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              value={announcement.title}
              onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={announcement.content}
              onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
              required
            />
          </div>
          <button type="submit">Post Announcement</button>
        </form>
      )}

      {tab === 'event' && (
        <form onSubmit={postEvent} className="post-form">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={event.date}
              onChange={(e) => setEvent({ ...event, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Time *</label>
            <input
              type="time"
              value={event.time}
              onChange={(e) => setEvent({ ...event, time: e.target.value })}
              required
            />
          </div>
          <button type="submit">Post Event</button>
        </form>
      )}
    </div>
  );
}