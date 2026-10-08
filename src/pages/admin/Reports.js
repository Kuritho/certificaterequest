// src/pages/admin/Reports.js
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { dataService } from '../../services/dataService';
import { format } from 'date-fns';
import ConfirmModal from '../../components/ConfirmModal';

export default function Reports() {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '', status: '', dateFrom: '', dateTo: '' });
  const [selectedReports, setSelectedReports] = useState([]);

  const [confirm, setConfirm] = useState({
    open: false, title: '', message: '', confirmLabel: 'Confirm',
    variant: 'danger', icon: 'warning', loading: false, onConfirm: null,
  });
  const openConfirm = (config) => setConfirm({ open: true, loading: false, ...config });
  const closeConfirm = () => setConfirm((prev) => ({ ...prev, open: false, loading: false }));

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificate_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRequests(data || []);
      setFiltered(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('Failed to load requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...requests];
    if (filter.type) result = result.filter((r) => r.certificate_type === filter.type);
    if (filter.status) result = result.filter((r) => r.status === filter.status);
    if (filter.dateFrom) result = result.filter((r) => new Date(r.created_at) >= new Date(filter.dateFrom));
    if (filter.dateTo) result = result.filter((r) => new Date(r.created_at) <= new Date(filter.dateTo + 'T23:59:59'));
    setFiltered(result);
    setSelectedReports([]);
  }, [filter, requests]);

  const handleExport = () => {
    const header = 'ID,User,Certificate,Status,Date\n';
    const rows = filtered.map((r) => `${r.id},"${r.user_name}",${r.certificate_type},${r.status},${format(new Date(r.created_at), 'yyyy-MM-dd')}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sacramental_requests_report.csv';
    a.click();
  };

  const handleDeleteSelected = () => {
    if (selectedReports.length === 0) {
      alert('Please select at least one report to delete.');
      return;
    }
    openConfirm({
      title: `Delete ${selectedReports.length} report${selectedReports.length > 1 ? 's' : ''}?`,
      message: 'The selected reports will be permanently removed from the database.',
      confirmLabel: `Delete ${selectedReports.length}`,
      variant: 'danger',
      icon: 'trash',
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        try {
          await dataService.deleteMultipleRequests(selectedReports);
          await loadRequests();
          setSelectedReports([]);
          closeConfirm();
        } catch (err) {
          alert('❌ Error deleting: ' + err.message);
          closeConfirm();
        }
      },
    });
  };

  const handleDeleteAll = () => {
    if (filtered.length === 0) {
      alert('No reports to delete.');
      return;
    }
    openConfirm({
      title: 'Delete ALL filtered reports?',
      message: `⚠️ You are about to permanently delete ALL ${filtered.length} filtered reports. This cannot be undone.`,
      confirmLabel: `Delete All (${filtered.length})`,
      variant: 'danger',
      icon: 'warning',
      onConfirm: async () => {
        setConfirm((prev) => ({ ...prev, loading: true }));
        try {
          const ids = filtered.map((r) => r.id);
          await dataService.deleteMultipleRequests(ids);
          await loadRequests();
          setSelectedReports([]);
          closeConfirm();
        } catch (err) {
          alert('❌ Error deleting: ' + err.message);
          closeConfirm();
        }
      },
    });
  };

  const toggleSelection = (id) => {
    setSelectedReports((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedReports.length === filtered.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filtered.map((r) => r.id));
    }
  };

  const total = filtered.length;
  const pending = filtered.filter((r) => r.status === 'pending').length;
  const completed = filtered.filter((r) => r.status === 'completed').length;

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      <h2>Reports</h2>

      <div className="report-filters">
        <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option value="">All Types</option><option>Baptism</option><option>Confirmation</option><option>Marriage</option>
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option><option>pending</option><option>processing</option><option>ready</option><option>completed</option><option>rejected</option>
        </select>
        <input type="date" placeholder="From" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
        <input type="date" placeholder="To" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
        <button onClick={handleExport}>📥 Export CSV</button>
        <button onClick={handleDeleteSelected} disabled={selectedReports.length === 0} style={{ background: '#8B1A1A', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 15px', cursor: selectedReports.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedReports.length === 0 ? 0.5 : 1 }}>
          🗑️ Delete Selected ({selectedReports.length})
        </button>
        <button onClick={handleDeleteAll} style={{ background: '#8B1A1A', color: '#fff', border: '2px solid #8B1A1A', borderRadius: '4px', padding: '6px 15px', cursor: 'pointer' }}>⚠️ Delete All</button>
      </div>

      <div className="report-summary">
        <p>Total: {total} | Pending: {pending} | Completed: {completed}</p>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th style={{ width: '30px' }}><input type="checkbox" checked={selectedReports.length === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
            <th>ID</th><th>User</th><th>Certificate</th><th>Status</th><th>Date Requested</th><th>Appointment</th><th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id}>
              <td><input type="checkbox" checked={selectedReports.includes(r.id)} onChange={() => toggleSelection(r.id)} /></td>
              <td>{r.id}</td><td>{r.user_name}</td><td>{r.certificate_type}</td>
              <td><span className={`status-${r.status}`}>{r.status}</span></td>
              <td>{format(new Date(r.created_at), 'yyyy-MM-dd')}</td>
              <td>{r.appointment_date} {r.appointment_time}</td><td>{r.payment_method}</td>
            </tr>
          ))}
          {filtered.length === 0 && (<tr><td colSpan="8">No records found.</td></tr>)}
        </tbody>
      </table>

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