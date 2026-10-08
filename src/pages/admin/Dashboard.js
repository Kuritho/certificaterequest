// src/pages/admin/Dashboard.js
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { dataService } from '../../services/dataService';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';

const Icon = ({ name, size = 20 }) => {
  const icons = {
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    megaphone: <><path d="M3 11l18-8v18l-18-8z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></>,
    sparkle: <><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

const statusConfig = {
  pending: { label: 'Pending', color: '#B45309', bg: 'rgba(217, 119, 6, 0.1)' },
  processing: { label: 'Processing', color: '#6D28D9', bg: 'rgba(139, 92, 246, 0.1)' },
  ready: { label: 'Ready', color: '#15803D', bg: 'rgba(22, 163, 74, 0.1)' },
  completed: { label: 'Completed', color: '#3A4A5E', bg: 'rgba(10, 22, 40, 0.08)' },
  rejected: { label: 'Rejected', color: '#B91C1C', bg: 'rgba(220, 38, 38, 0.1)' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [confirm, setConfirm] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    icon: 'warning',
    loading: false,
    onConfirm: null,
  });

  const openConfirm = (config) => setConfirm({ open: true, loading: false, ...config });
  const closeConfirm = () => setConfirm((prev) => ({ ...prev, open: false, loading: false }));

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
      setRequests(req.data || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = (id, title) => {
    openConfirm({
      title: 'Delete announcement?',
      message: `"${title}" will be permanently removed from the parish board. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'trash',
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        try {
          await dataService.deleteAnnouncement(id);
          setAnnouncements((prev) => prev.filter((a) => a.id !== id));
          closeConfirm();
        } catch (err) {
          alert('❌ Failed to delete announcement: ' + err.message);
          closeConfirm();
        }
      },
    });
  };

  const handleDeleteEvent = (id, title) => {
    openConfirm({
      title: 'Delete event?',
      message: `"${title}" will be removed from the parish calendar. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      icon: 'trash',
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        try {
          await dataService.deleteEvent(id);
          setEvents((prev) => prev.filter((e) => e.id !== id));
          closeConfirm();
        } catch (err) {
          alert('❌ Failed to delete event: ' + err.message);
          closeConfirm();
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-ring"></div>
        <p>Loading admin dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>We couldn't load the dashboard.</p>
        <p className="error-detail">{error}</p>
        <button onClick={loadData}>Try again</button>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processingRequests = requests.filter(r => r.status === 'processing');
  const readyRequests = requests.filter(r => r.status === 'ready');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const todayRequests = requests.filter(r => {
    const d = new Date(r.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const now = new Date();

  return (
    <div className="dashboard">
      {/* ===== HERO ===== */}
      <section className="dash-hero dash-hero-admin">
        <div className="dash-hero-content">
          <p className="dash-hero-date">{format(now, 'EEEE, MMMM d, yyyy')}</p>
          <h1 className="dash-hero-title">Parish Administration</h1>
          <p className="dash-hero-sub">
            {pendingRequests.length > 0
              ? `You have ${pendingRequests.length} request${pendingRequests.length > 1 ? 's' : ''} awaiting review.`
              : 'All requests are up to date. Well done.'}
          </p>
          <div className="dash-hero-actions">
            <button className="dash-btn-primary" onClick={() => navigate('/admin/review')}>
              <Icon name="check" size={16} />
              Review Requests
            </button>
            <button className="dash-btn-secondary" onClick={() => navigate('/admin/reports')}>
              <Icon name="chart" size={16} />
              View Reports
            </button>
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
        <MetricCard label="Pending Review" value={pendingRequests.length} icon="clock" accent="#D97706" hint="Awaiting your action" onClick={() => navigate('/admin/review')} />
        <MetricCard label="In Processing" value={processingRequests.length} icon="file" accent="#6D28D9" hint="Being prepared" />
        <MetricCard label="Ready for Pickup" value={readyRequests.length} icon="check" accent="#15803D" hint="Waiting for claimants" />
        <MetricCard label="Total Requests" value={requests.length} icon="users" accent="#3B82C4" hint={`${completedRequests.length} completed all-time`} />
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className="dash-section">
        <header className="dash-section-head">
          <div>
            <h2>Quick Actions</h2>
            <p className="dash-section-sub">Common administrative tasks</p>
          </div>
        </header>
        <div className="dash-actions-grid">
          <ActionCard icon="check" title="Review Requests" desc={`${pendingRequests.length} awaiting review`} onClick={() => navigate('/admin/review')} accent="#3B82C4" />
          <ActionCard icon="megaphone" title="Post Announcement" desc="Share news with parishioners" onClick={() => navigate('/admin/post')} accent="#C9A961" />
          <ActionCard icon="chart" title="View Reports" desc="Export and analyze requests" onClick={() => navigate('/admin/reports')} accent="#6D28D9" />
          <ActionCard icon="calendar" title="Manage Events" desc={`${events.length} upcoming events`} onClick={() => navigate('/admin/post')} accent="#15803D" />
        </div>
      </section>

      {/* ===== TWO COLUMN ===== */}
      <div className="dash-grid">
        <div className="dash-col-main">
          <section className="dash-section">
            <header className="dash-section-head">
              <div>
                <h2>Recent Requests</h2>
                <p className="dash-section-sub">Latest submissions from parishioners</p>
              </div>
              <button className="dash-link" onClick={() => navigate('/admin/review')}>
                View all <Icon name="arrow" size={14} />
              </button>
            </header>
            {requests.length === 0 ? (
              <EmptyState icon="file" title="No requests yet" message="Requests will appear here once parishioners submit them." />
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>ID</th><th>Requestor</th><th>Certificate</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {requests.slice(0, 6).map(r => (
                      <tr key={r.id} onClick={() => navigate('/admin/review')}>
                        <td className="dash-table-id">#{r.id}</td>
                        <td>{r.user_name || 'Unknown'}</td>
                        <td>{r.certificate_type}</td>
                        <td className="dash-table-date">{format(new Date(r.created_at), 'MMM d')}</td>
                        <td>
                          <span className={`dash-status-pill dash-status-${r.status}`}>
                            <span className="dash-status-dot"></span>
                            {statusConfig[r.status]?.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="dash-section">
            <header className="dash-section-head">
              <div>
                <h2>Announcements</h2>
                <p className="dash-section-sub">Published to parishioners</p>
              </div>
              <span className="dash-count-badge">{announcements.length}</span>
            </header>
            {announcements.length === 0 ? (
              <EmptyState icon="megaphone" title="No announcements" message="Post your first announcement to get started." action={{ label: 'Post announcement', onClick: () => navigate('/admin/post') }} />
            ) : (
              <div className="dash-list">
                {announcements.slice(0, 4).map(a => (
                  <div key={a.id} className="dash-list-item">
                    <div className="dash-list-icon" style={{ background: 'rgba(201, 169, 97, 0.12)', color: '#8B7340' }}>
                      <Icon name="megaphone" size={18} />
                    </div>
                    <div className="dash-list-body">
                      <div className="dash-list-title">{a.title}</div>
                      <div className="dash-list-meta dash-clamp-2">{a.content}</div>
                    </div>
                    <div className="dash-list-end">
                      <time>{format(new Date(a.created_at), 'MMM d')}</time>
                      <button
                        className="dash-icon-btn"
                        onClick={() => handleDeleteAnnouncement(a.id, a.title)}
                        title="Delete"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="dash-col-side">
          <section className="dash-side-card">
            <header className="dash-section-head">
              <div>
                <h2>Request Breakdown</h2>
                <p className="dash-section-sub">By current status</p>
              </div>
            </header>
            <ul className="dash-breakdown">
              <BreakdownRow label="Pending" value={pendingRequests.length} total={requests.length} color="#D97706" />
              <BreakdownRow label="Processing" value={processingRequests.length} total={requests.length} color="#6D28D9" />
              <BreakdownRow label="Ready" value={readyRequests.length} total={requests.length} color="#15803D" />
              <BreakdownRow label="Completed" value={completedRequests.length} total={requests.length} color="#3B82C4" />
            </ul>
          </section>

          <section className="dash-side-card">
            <header className="dash-section-head">
              <div>
                <h2>Today</h2>
                <p className="dash-section-sub">{format(now, 'MMM d, yyyy')}</p>
              </div>
              <span className="dash-count-badge">{todayRequests.length}</span>
            </header>
            {todayRequests.length === 0 ? (
              <EmptyState icon="calendar" title="No activity today" message="New requests will appear here." compact />
            ) : (
              <ul className="dash-notif-list">
                {todayRequests.slice(0, 4).map(r => (
                  <li key={r.id} className="dash-notif-item">
                    <span className="dash-notif-dot" style={{ background: statusConfig[r.status]?.color }}></span>
                    <div>
                      <p>{r.user_name} — {r.certificate_type}</p>
                      <time>{format(new Date(r.created_at), 'HH:mm')}</time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dash-side-card">
            <header className="dash-section-head">
              <div>
                <h2>Upcoming Events</h2>
                <p className="dash-section-sub">Parish calendar</p>
              </div>
            </header>
            {events.length === 0 ? (
              <EmptyState icon="calendar" title="No events" message="Add events to your parish calendar." compact />
            ) : (
              <ul className="dash-event-list">
                {events.slice(0, 4).map(e => {
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
                      <button
                        className="dash-icon-btn"
                        onClick={() => handleDeleteEvent(e.id, e.title)}
                        title="Delete"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        variant={confirm.variant}
        icon={confirm.icon}
        loading={confirm.loading}
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function MetricCard({ label, value, icon, accent, hint, onClick }) {
  return (
    <div className={`dash-metric ${onClick ? 'clickable' : ''}`} style={{ '--accent': accent }} onClick={onClick}>
      <div className="dash-metric-top">
        <div className="dash-metric-icon"><Icon name={icon} size={18} /></div>
        <span className="dash-metric-label">{label}</span>
      </div>
      <div className="dash-metric-value">{value}</div>
      <div className="dash-metric-hint">{hint}</div>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, accent }) {
  return (
    <button className="dash-action-card" onClick={onClick} style={{ '--accent': accent }}>
      <div className="dash-action-icon"><Icon name={icon} size={20} /></div>
      <div className="dash-action-body">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <div className="dash-action-arrow"><Icon name="arrow" size={16} /></div>
    </button>
  );
}

function BreakdownRow({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <li className="dash-breakdown-row">
      <div className="dash-breakdown-head">
        <span className="dash-breakdown-label">
          <span className="dash-breakdown-dot" style={{ background: color }}></span>
          {label}
        </span>
        <span className="dash-breakdown-value">{value}</span>
      </div>
      <div className="dash-breakdown-track">
        <div className="dash-breakdown-fill" style={{ width: `${pct}%`, background: color }}></div>
      </div>
    </li>
  );
}

function EmptyState({ icon, title, message, action, compact }) {
  return (
    <div className={`dash-empty ${compact ? 'compact' : ''}`}>
      <div className="dash-empty-icon"><Icon name={icon} size={compact ? 20 : 28} /></div>
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