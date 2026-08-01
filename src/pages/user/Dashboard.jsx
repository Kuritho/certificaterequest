import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ann = JSON.parse(localStorage.getItem('sacramental_announcements') || '[]');
    const ev = JSON.parse(localStorage.getItem('sacramental_events') || '[]');
    const allReq = JSON.parse(localStorage.getItem('sacramental_requests') || '[]');
    const notif = JSON.parse(localStorage.getItem('sacramental_notifications') || '[]');
    setAnnouncements(ann);
    setEvents(ev);
    setMyRequests(allReq.filter(r => r.userId === user.id));
    setNotifications(notif.filter(n => n.userId === user.id));
  }, [user.id]);

  const pendingCount = myRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>Welcome, {user.name}!</h2>
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
              <small>{format(new Date(a.date), 'MMM dd, yyyy')}</small>
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
          {notifications.slice(-3).map((n, idx) => (
            <article key={idx} className="dashboard-card small-card">
              <p>{n.message}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}