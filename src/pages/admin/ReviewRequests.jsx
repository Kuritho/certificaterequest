import { useState, useEffect } from 'react';

export default function ReviewRequests() {
  const [requests, setRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const all = JSON.parse(localStorage.getItem('sacramental_requests') || '[]');
    setRequests(all);
  };

  const updateRequest = (id, updates) => {
    const all = JSON.parse(localStorage.getItem('sacramental_requests') || '[]');
    const index = all.findIndex(r => r.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      localStorage.setItem('sacramental_requests', JSON.stringify(all));
      loadRequests();
    }
  };

  const verifyPayment = (id) => {
    updateRequest(id, { paymentStatus: 'verified' });
    sendNotification(id, 'Your GCash payment has been verified.');
    setStatusMessage('Payment verified. Email sent.');
  };

  const updateStatus = (id, newStatus) => {
    updateRequest(id, { status: newStatus });
    sendNotification(id, `Your request status has been updated to "${newStatus}".`);
    setStatusMessage(`Status updated to ${newStatus}. Email sent.`);
  };

  const [preview, setPreview] = useState(null);

  const sendNotification = (requestId, message) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;
    const notif = JSON.parse(localStorage.getItem('sacramental_notifications') || '[]');
    notif.push({
      userId: req.userId,
      message: message,
      date: new Date().toISOString()
    });
    localStorage.setItem('sacramental_notifications', JSON.stringify(notif));
    // Also show alert for demo
    alert(`📧 Simulated email to user: "${message}"`);
  };

  const sendManualEmail = (requestId) => {
    const message = prompt('Enter email message to send:');
    if (message) {
      sendNotification(requestId, message);
    }
  };

  return (
    <div className="review-page">
      <h2>Review Certificate Requests</h2>
      {statusMessage && <div className="status-message">{statusMessage}</div>}
      {requests.length === 0 && <p>No requests yet.</p>}
      <div className="requests-table">
        <table>
          <thead>
            <tr>
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
                <td>#{req.id}</td>
                <td>{req.userName}</td>
                <td>{req.certificateType}</td>
                <td>{req.email}</td>
                <td>{req.dob}</td>
                <td>{req.appointmentDate} <br /> {req.appointmentTime}</td>
                <td>
                  {req.paymentMethod?.toUpperCase()}
                  {req.paymentMethod === 'gcash' && req.paymentStatus && (
                    <div className={req.paymentStatus === 'verified' ? 'verified' : 'unverified'}>
                      {req.paymentStatus}
                    </div>
                  )}
                </td>
                <td>
                  {req.paymentMethod === 'gcash' && req.receipt ? (
                    <button type="button" className="link-button" onClick={() => setPreview({ title: req.receipt.name, file: req.receipt.data, type: req.receipt.type })}>
                      {req.receipt.name}
                    </button>
                  ) : null}
                  {req.requirements ? (
                    <button type="button" className="link-button" onClick={() => setPreview({ title: req.requirements.name, file: req.requirements.data, type: req.requirements.type })}>
                      {req.requirements.name}
                    </button>
                  ) : null}
                </td>
                <td><span className={`status-badge status-${req.status}`}>{req.status}</span></td>
                <td className="request-actions">
                  {req.paymentMethod === 'gcash' && req.paymentStatus !== 'verified' && (
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
            {preview.type.startsWith('image/') ? (
              <img src={preview.file} alt={preview.title} className="preview-image" />
            ) : (
              <div className="preview-file">
                <p>{preview.title}</p>
                <p>File type: {preview.type}</p>
                <p>Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}