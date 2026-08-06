// src/pages/admin/ReviewRequests.js
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { dataService } from '../../services/dataService';

export default function ReviewRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('Failed to load requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update a single request
  const updateRequest = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('certificate_requests')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      await loadRequests();
      return true;
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request: ' + error.message);
      return false;
    }
  };

  // Delete a single request
  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await dataService.deleteRequest(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      setStatusMessage('✅ Request deleted successfully!');
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('❌ Failed to delete request: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk delete selected requests
  const handleBulkDelete = async () => {
    if (selectedRequests.length === 0) {
      alert('Please select at least one request to delete.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedRequests.length} selected request(s)? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await dataService.deleteMultipleRequests(selectedRequests);
      setRequests(prev => prev.filter(r => !selectedRequests.includes(r.id)));
      setSelectedRequests([]);
      setStatusMessage(`✅ ${selectedRequests.length} request(s) deleted successfully!`);
    } catch (error) {
      console.error('Error deleting requests:', error);
      alert('❌ Failed to delete requests: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Delete all requests
  const handleDeleteAll = async () => {
    if (requests.length === 0) {
      alert('No requests to delete.');
      return;
    }
    
    if (!window.confirm(`⚠️ Are you sure you want to delete ALL ${requests.length} requests? This action cannot be undone!`)) {
      return;
    }
    
    if (!window.confirm(`⚠️⚠️ FINAL CONFIRMATION: Delete all ${requests.length} requests?`)) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      await dataService.deleteAllRequests();
      setRequests([]);
      setSelectedRequests([]);
      setStatusMessage(`✅ All requests deleted successfully!`);
    } catch (error) {
      console.error('Error deleting all requests:', error);
      alert('❌ Failed to delete all requests: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle selection for a request
  const toggleSelection = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Select all requests
  const selectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map(r => r.id));
    }
  };

  const verifyPayment = async (id) => {
    const success = await updateRequest(id, { payment_status: 'verified' });
    if (success) {
      await sendNotification(id, 'Your GCash payment has been verified.');
      setStatusMessage('✅ Payment verified. Notification sent.');
    }
  };

  const updateStatus = async (id, newStatus) => {
    const success = await updateRequest(id, { status: newStatus });
    if (success) {
      await sendNotification(id, `Your request status has been updated to "${newStatus}".`);
      setStatusMessage(`✅ Status updated to ${newStatus}. Notification sent.`);
    }
  };

  const sendNotification = async (requestId, message) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    
    try {
      await supabase
        .from('notifications')
        .insert([{
          user_id: req.user_id,
          message: message
        }]);
      alert(`📧 Notification sent to user: "${message}"`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const sendManualEmail = async (requestId) => {
    const message = prompt('Enter email message to send:');
    if (message) {
      await sendNotification(requestId, message);
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="review-page">
      <h2>Review Certificate Requests</h2>
      
      {statusMessage && (
        <div className="status-message" style={{
          background: statusMessage.includes('✅') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(139, 26, 26, 0.1)',
          borderColor: statusMessage.includes('✅') ? '#27ae60' : '#8B1A1A',
          color: statusMessage.includes('✅') ? '#27ae60' : '#8B1A1A'
        }}>
          {statusMessage}
          <button 
            onClick={() => setStatusMessage('')}
            style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Bulk Action Buttons */}
      {requests.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          marginBottom: '20px',
          padding: '15px',
          background: '#f5f0e6',
          borderRadius: '8px',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#4A2810' }}>
            {selectedRequests.length} selected
          </span>
          <button
            onClick={selectAll}
            style={{
              padding: '6px 15px',
              background: '#4A2810',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {selectedRequests.length === requests.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedRequests.length === 0 || deleteLoading}
            style={{
              padding: '6px 15px',
              background: '#8B1A1A',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedRequests.length === 0 || deleteLoading ? 'not-allowed' : 'pointer',
              opacity: selectedRequests.length === 0 || deleteLoading ? 0.5 : 1
            }}
          >
            🗑️ Delete Selected ({selectedRequests.length})
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={deleteLoading}
            style={{
              padding: '6px 15px',
              background: '#8B1A1A',
              color: '#fff',
              border: '2px solid #8B1A1A',
              borderRadius: '4px',
              cursor: deleteLoading ? 'not-allowed' : 'pointer',
              opacity: deleteLoading ? 0.5 : 1
            }}
          >
            ⚠️ Delete All
          </button>
          <button
            onClick={loadRequests}
            style={{
              padding: '6px 15px',
              background: '#C5A55A',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      )}

      {requests.length === 0 && <p>No requests yet.</p>}
      
      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '30px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedRequests.length === requests.length && requests.length > 0}
                  onChange={selectAll}
                />
              </th>
              <th>ID</th>
              <th>Requestor</th>
              <th>Certificate</th>
              <th>Email</th>
              <th>DOB</th>
              <th>Appointment</th>
              <th>Payment</th>
              <th>Files</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedRequests.includes(req.id)}
                    onChange={() => toggleSelection(req.id)}
                    disabled={deleteLoading}
                  />
                </td>
                <td>#{req.id}</td>
                <td>{req.user_name}</td>
                <td>{req.certificate_type}</td>
                <td>{req.email}</td>
                <td>{req.dob}</td>
                <td>{req.appointment_date} <br /> {req.appointment_time}</td>
                <td>
                  {req.payment_method?.toUpperCase()}
                  {req.payment_method === 'gcash' && req.payment_status && (
                    <div className={req.payment_status === 'verified' ? 'verified' : 'unverified'}>
                      {req.payment_status}
                    </div>
                  )}
                </td>
                <td>
                  {req.payment_method === 'gcash' && req.receipt_data ? (
                    <button type="button" className="link-button" onClick={() => setPreview({ 
                      title: req.receipt_name || 'Receipt', 
                      file: req.receipt_data, 
                      type: req.receipt_type 
                    })}>
                      {req.receipt_name || 'Receipt'}
                    </button>
                  ) : null}
                  {req.requirements_data ? (
                    <button type="button" className="link-button" onClick={() => setPreview({ 
                      title: req.requirements_name || 'Requirements', 
                      file: req.requirements_data, 
                      type: req.requirements_type 
                    })}>
                      {req.requirements_name || 'Requirements'}
                    </button>
                  ) : null}
                </td>
                <td><span className={`status-badge status-${req.status}`}>{req.status}</span></td>
                <td className="request-actions">
                  {req.payment_method === 'gcash' && req.payment_status !== 'verified' && (
                    <button onClick={() => verifyPayment(req.id)}>Verify</button>
                  )}
                  <select value={req.status} onChange={(e) => updateStatus(req.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready for Pickup</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={() => sendManualEmail(req.id)}>Email</button>
                  <button 
                    onClick={() => handleDeleteRequest(req.id)}
                    disabled={deleteLoading}
                    style={{
                      background: '#8B1A1A',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: deleteLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preview && (
        <div className="preview-overlay" onClick={() => setPreview(null)}>
          <div className="preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <strong>{preview.title}</strong>
              <button className="close-modal-btn" onClick={() => setPreview(null)}>✕</button>
            </div>
            {preview.type?.startsWith('image/') ? (
              <img src={preview.file} alt={preview.title} className="preview-image" />
            ) : (
              <div className="preview-file">
                <p>{preview.title}</p>
                <p>File type: {preview.type || 'Unknown'}</p>
                <p>Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}