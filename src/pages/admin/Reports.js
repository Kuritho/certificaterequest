import { useState, useEffect } from 'react';

export default function Reports() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState({ type: '', status: '', dateFrom: '', dateTo: '' });
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('sacramental_requests') || '[]');
    setRequests(all);
    setFiltered(all);
  }, []);

  useEffect(() => {
    let result = [...requests];
    if (filter.type) result = result.filter(r => r.certificateType === filter.type);
    if (filter.status) result = result.filter(r => r.status === filter.status);
    if (filter.dateFrom) result = result.filter(r => new Date(r.createdAt) >= new Date(filter.dateFrom));
    if (filter.dateTo) result = result.filter(r => new Date(r.createdAt) <= new Date(filter.dateTo + 'T23:59:59'));
    setFiltered(result);
  }, [filter, requests]);

  const handleExport = () => {
    const header = 'ID,User,Certificate,Status,Date\n';
    const rows = filtered.map(r => `${r.id},"${r.userName}",${r.certificateType},${r.status},${new Date(r.createdAt).toLocaleDateString()}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sacramental_requests_report.csv';
    a.click();
  };

  const total = filtered.length;
  const pending = filtered.filter(r => r.status === 'pending').length;
  const completed = filtered.filter(r => r.status === 'completed').length;

  return (
    <div className="reports-page">
      <h2>Reports</h2>
      <div className="report-filters">
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All Types</option>
          <option>Baptism</option>
          <option>Confirmation</option>
          <option>Marriage</option>
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          <option>pending</option>
          <option>processing</option>
          <option>ready</option>
          <option>completed</option>
          <option>rejected</option>
        </select>
        <input type="date" placeholder="From" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
        <input type="date" placeholder="To" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
        <button onClick={handleExport}>Export CSV</button>
      </div>

      <div className="report-summary">
        <p>Total: {total} | Pending: {pending} | Completed: {completed}</p>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Certificate</th>
            <th>Status</th>
            <th>Date Requested</th>
            <th>Appointment</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.userName}</td>
              <td>{r.certificateType}</td>
              <td><span className={`status-${r.status}`}>{r.status}</span></td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>{r.appointmentDate} {r.appointmentTime}</td>
              <td>{r.paymentMethod}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan="7">No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}