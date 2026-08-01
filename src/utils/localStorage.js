export function initData() {
  if (!localStorage.getItem('sacramental_users')) {
    localStorage.setItem('sacramental_users', JSON.stringify([
      { id: 1, name: 'Admin User', email: 'admin@parish.com', password: 'admin123', role: 'admin' },
      { id: 2, name: 'John Doe', email: 'john@example.com', password: 'john123', role: 'user' }
    ]));
  }
  if (!localStorage.getItem('sacramental_requests')) {
    localStorage.setItem('sacramental_requests', JSON.stringify([]));
  }
  if (!localStorage.getItem('sacramental_announcements')) {
    localStorage.setItem('sacramental_announcements', JSON.stringify([
      { id: 1, title: 'Welcome to Our Parish', content: 'The sacramental records system is now online.', date: new Date().toISOString() }
    ]));
  }
  if (!localStorage.getItem('sacramental_events')) {
    localStorage.setItem('sacramental_events', JSON.stringify([
      { id: 1, title: 'Sunday Mass', date: '2026-08-02', time: '10:00 AM' },
      { id: 2, title: 'Baptism Seminar', date: '2026-08-15', time: '2:00 PM' }
    ]));
  }
  if (!localStorage.getItem('sacramental_notifications')) {
    localStorage.setItem('sacramental_notifications', JSON.stringify([]));
  }
}