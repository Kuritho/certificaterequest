import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    const ann = JSON.parse(localStorage.getItem('sacramental_announcements') || '[]');
    const ev = JSON.parse(localStorage.getItem('sacramental_events') || '[]');
    const allReq = JSON.parse(localStorage.getItem('sacramental_requests') || '[]');
    setAnnouncements(ann);
    setEvents(ev);
    setPendingRequests(allReq.filter(r => r.status === 'pending'));
    setTotalRequests(allReq.length);
  }, []);

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
            <article key={a.id} className="dashboard-card small-card">
              <strong>{a.title}</strong>
              <p>{a.content}</p>
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
          <h3>Pending Requests</h3>
          <span>{pendingRequests.length} open</span>
        </div>
        <div className="section-grid">
          {pendingRequests.length === 0 && <p>All requests are up to date.</p>}
          {pendingRequests.map((r) => (
            <article key={r.id} className="dashboard-card small-card">
              <strong>#{r.id} {r.certificateType}</strong>
              <p>{r.userName || 'Requester not found'}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}