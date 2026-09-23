// src/pages/user/Dashboard.js
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Elegant inline SVG icons
const Icon = ({ name, size = 20 }) => {
  const icons = {
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    megaphone: <><path d="M3 11l18-8v18l-18-8z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>,
    sparkle: <><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const statusConfig = {
  pending: { label: 'Pending Review', color: '#B45309', bg: 'rgba(217, 119, 6, 0.1)' },
  processing: { label: 'Processing', color: '#6D28D9', bg: 'rgba(139, 92, 246, 0.1)' },
  ready: { label: 'Ready for Pickup', color: '#15803D', bg: 'rgba(22, 163, 74, 0.1)' },
  completed: { label: 'Completed', color: '#3A4A5E', bg: 'rgba(10, 22, 40, 0.08)' },
  rejected: { label: 'Rejected', color: '#B91C1C', bg: 'rgba(220, 38, 38, 0.1)' },
};

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) loadData();
    else setLoading(false);
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ann, ev, req, notif] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('certificate_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      if (ann.error) throw new Error(ann.error.message);
      if (ev.error) throw new Error(ev.error.message);
      if (req.error) throw new Error(req.error.message);
      if (notif.error) throw new Error(notif.error.message);
      setAnnouncements(ann.data || []);
      setEvents(ev.data || []);
      setMyRequests(req.data || []);
      setNotifications(notif.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-ring"></div>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>We couldn't load your dashboard.</p>
        <p className="error-detail">{error}</p>
        <button onClick={loadData}>Try again</button>
      </div>
    );
  }

  const pendingCount = myRequests.filter(r => r.status !== 'completed' && r.status !== 'rejected').length;
  const completedCount = myRequests.filter(r => r.status === 'completed').length;
  const activeRequest = myRequests.find(r => r.status === 'pending' || r.status === 'processing' || r.status === 'ready');

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.name || 'Friend').split(' ')[0];

  return (
    <div className="dashboard">
      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero-content">
          <p className="dash-hero-date">
            {format(now, 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="dash-hero-title">
            {greeting}, <span className="dash-hero-name">{firstName}</span>
          </h1>
          <p className="dash-hero-sub">
            {activeRequest
              ? `Your ${activeRequest.certificate_type} certificate request is currently ${activeRequest.status}.`
              : 'Welcome to your parish portal. Request certificates, track progress, and stay connected.'}
          </p>
          <div className="dash-hero-actions">
            <button className="dash-btn-primary" onClick={() => navigate('/user/request')}>
              <Icon name="plus" size={16} />
              New Certificate Request
            </button>
            {activeRequest && (
              <span className={`dash-status-pill dash-status-${activeRequest.status}`}>
                <span className="dash-status-dot"></span>
                {statusConfig[activeRequest.status]?.label}
              </span>
            )}
          </div>
        </div>
        <div className="dash-hero-ornament" aria-hidden="true">
          <div className="hero-arch"></div>
          <div className="hero-cross">
            <div className="hero-cross-v"></div>
            <div className="hero-cross-h"></div>
          </div>
        </div>
      </section>

      {/* ===== METRICS ===== */}
      <section className="dash-metrics">
        <MetricCard
          label="Total Requests"
          value={myRequests.length}
          icon="file"
          accent="#3B82C4"
          hint="All-time submissions"
        />
        <MetricCard
          label="In Progress"
          value={pendingCount}
          icon="clock"
          accent="#D97706"
          hint="Awaiting review or pickup"
        />
        <MetricCard
          label="Completed"
          value={completedCount}
          icon="check"
          accent="#15803D"
          hint="Successfully delivered"
        />
        <MetricCard
          label="Notifications"
          value={notifications.length}
          icon="bell"
          accent="#C9A961"
          hint="Messages from parish"
        />
      </section>

      {/* ===== TWO COLUMN LAYOUT ===== */}
      <div className="dash-grid">
        {/* LEFT COLUMN */}
        <div className="dash-col-main">
          {/* Active request tracker */}
          {activeRequest && (
            <section className="dash-section">
              <header className="dash-section-head">
                <div>
                  <h2>Current Request</h2>
                  <p className="dash-section-sub">Track your most recent submission</p>
                </div>
                <button className="dash-link" onClick={() => navigate('/user/request')}>
                  View all <Icon name="arrow" size={14} />
                </button>
              </header>
              <RequestTracker request={activeRequest} />
            </section>
          )}

          {/* Recent requests */}
          <section className="dash-section">
            <header className="dash-section-head">
              <div>
                <h2>Recent Activity</h2>
                <p className="dash-section-sub">Your latest certificate requests</p>
              </div>
            </header>
            {myRequests.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="No requests yet"
                message="When you submit a certificate request, it will appear here."
                action={{ label: 'Create your first request', onClick: () => navigate('/user/request') }}
              />
            ) : (
              <div className="dash-list">
                {myRequests.slice(0, 5).map(req => (
                  <div key={req.id} className="dash-list-item">
                    <div className="dash-list-icon" style={{ background: statusConfig[req.status]?.bg, color: statusConfig[req.status]?.color }}>
                      <Icon name="file" size={18} />
                    </div>
                    <div className="dash-list-body">
                      <div className="dash-list-title">
                        {req.certificate_type} Certificate
                      </div>
                      <div className="dash-list-meta">
                        Request #{req.id} · Submitted {format(new Date(req.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <span className={`dash-status-pill dash-status-${req.status}`}>
                      <span className="dash-status-dot"></span>
                      {statusConfig[req.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Announcements */}
          <section className="dash-section">
            <header className="dash-section-head">
              <div>
                <h2>Parish Announcements</h2>
                <p className="dash-section-sub">Latest news from the parish office</p>
              </div>
              <span className="dash-count-badge">{announcements.length}</span>
            </header>
            {announcements.length === 0 ? (
              <EmptyState icon="megaphone" title="No announcements" message="Check back soon for parish updates." />
            ) : (
              <div className="dash-announce-grid">
                {announcements.slice(0, 4).map(a => (
                  <article key={a.id} className="dash-announce-card">
                    <div className="dash-announce-icon">
                      <Icon name="sparkle" size={14} />
                    </div>
                    <h3>{a.title}</h3>
                    <p>{a.content}</p>
                    <time>{format(new Date(a.created_at), 'MMM d, yyyy')}</time>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="dash-col-side">
          {/* Events */}
          <section className="dash-side-card">
            <header className="dash-section-head">
              <div>
                <h2>Upcoming Events</h2>
                <p className="dash-section-sub">Mark your calendar</p>
              </div>
            </header>
            {events.length === 0 ? (
              <EmptyState icon="calendar" title="No events" message="Check back later." compact />
            ) : (
              <ul className="dash-event-list">
                {events.slice(0, 5).map(e => {
                  const d = new Date(e.date);
                  return (
                    <li key={e.id} className="dash-event-item">
                      <div className="dash-event-date">
                        <span className="dash-event-day">{format(d, 'd')}</span>
                        <span className="dash-event-month">{format(d, 'MMM')}</span>
                      </div>
                      <div className="dash-event-body">
                        <strong>{e.title}</strong>
                        <span>{e.time}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Notifications */}
          <section className="dash-side-card">
            <header className="dash-section-head">
              <div>
                <h2>Notifications</h2>
                <p className="dash-section-sub">Recent messages</p>
              </div>
              {notifications.length > 0 && (
                <span className="dash-count-badge">{notifications.length}</span>
              )}
            </header>
            {notifications.length === 0 ? (
              <EmptyState icon="bell" title="All caught up" message="No new notifications." compact />
            ) : (
              <ul className="dash-notif-list">
                {notifications.slice(0, 4).map(n => (
                  <li key={n.id} className="dash-notif-item">
                    <span className="dash-notif-dot"></span>
                    <div>
                      <p>{n.message}</p>
                      <time>{format(new Date(n.created_at), 'MMM d · HH:mm')}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Quick help */}
          <section className="dash-side-card dash-help-card">
            <div className="dash-help-icon">
              <Icon name="sparkle" size={20} />
            </div>
            <h3>Need assistance?</h3>
            <p>Visit the parish office during office hours or ask the administrator after login.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function MetricCard({ label, value, icon, accent, hint }) {
  return (
    <div className="dash-metric" style={{ '--accent': accent }}>
      <div className="dash-metric-top">
        <div className="dash-metric-icon">
          <Icon name={icon} size={18} />
        </div>
        <span className="dash-metric-label">{label}</span>
      </div>
      <div className="dash-metric-value">{value}</div>
      <div className="dash-metric-hint">{hint}</div>
    </div>
  );
}

function RequestTracker({ request }) {
  const steps = ['pending', 'processing', 'ready', 'completed'];
  const currentIndex = steps.indexOf(request.status);
  const isRejected = request.status === 'rejected';

  const stepLabels = {
    pending: 'Submitted',
    processing: 'In Review',
    ready: 'Ready for Pickup',
    completed: 'Completed',
  };

  return (
    <div className="tracker">
      <div className="tracker-header">
        <div>
          <div className="tracker-title">{request.certificate_type} Certificate</div>
          <div className="tracker-sub">
            Request #{request.id} · Appointment {request.appointment_date} at {request.appointment_time}
          </div>
        </div>
      </div>

      {isRejected ? (
        <div className="tracker-rejected">
          <Icon name="clock" size={16} />
          This request was rejected. Please contact the parish office.
        </div>
      ) : (
        <div className="tracker-steps">
          {steps.map((step, i) => {
            const done = i <= currentIndex;
            const active = i === currentIndex;
            return (
              <div key={step} className={`tracker-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                <div className="tracker-step-marker">
                  {done ? <Icon name="check" size={12} /> : <span>{i + 1}</span>}
                </div>
                <div className="tracker-step-label">{stepLabels[step]}</div>
                {i < steps.length - 1 && <div className="tracker-step-line" />}
              </div>
            );
          })}
        </div>
      )}

      <div className="tracker-meta">
        <div>
          <span className="tracker-meta-label">Payment</span>
          <span className="tracker-meta-value">
            {request.payment_method === 'gcash' ? 'GCash' : 'Cash on Pickup'} · {request.payment_status || 'pending'}
          </span>
        </div>
        <div>
          <span className="tracker-meta-label">Date of Birth</span>
          <span className="tracker-meta-value">{request.dob || '—'}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, message, action, compact }) {
  return (
    <div className={`dash-empty ${compact ? 'compact' : ''}`}>
      <div className="dash-empty-icon">
        <Icon name={icon} size={compact ? 20 : 28} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && (
        <button className="dash-btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}