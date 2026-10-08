// src/pages/user/RequestCertificate.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ConfirmModal from '../../components/ConfirmModal';

export default function RequestCertificate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    certificateType: 'Baptism',
    dob: '',
    fatherName: '',
    motherName: '',
    requirements: null,
    requirementsData: null,
    requirementsType: null,
    requirementsName: null,
    appointmentDate: '',
    appointmentTime: '',
    paymentMethod: 'cash',
    receipt: null,
    receiptData: null,
    receiptType: null,
    receiptName: null,
  });

  // Set form values when user is available
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const readFileData = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      const data = await readFileData(file);
      setForm((prev) => ({
        ...prev,
        [name]: file,
        [`${name}Data`]: data,
        [`${name}Type`]: file.type,
        [`${name}Name`]: file.name,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: User clicks "Submit Request" → open the confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!user?.id) {
      setError('You are not logged in. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Basic sanity check
    if (!form.fullName || !form.email || !form.dob || !form.appointmentDate || !form.appointmentTime) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    if (form.paymentMethod === 'gcash' && !form.receiptData) {
      setError('Please upload your GCash receipt.');
      return;
    }

    if (!form.requirementsData) {
      setError('Please upload the required documents.');
      return;
    }

    // Open the confirmation modal
    setShowConfirm(true);
  };

  // Step 2: User confirms inside the modal → actually submit to Supabase
  const confirmSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user?.id) {
        setError('You are not logged in. Please login again.');
        setLoading(false);
        setShowConfirm(false);
        return;
      }

      console.log('Submitting request for user:', user.id);

      const requestData = {
        user_id: user.id,
        user_name: user.name || 'Unknown',
        full_name: form.fullName,
        email: form.email,
        certificate_type: form.certificateType,
        dob: form.dob,
        father_name: form.fatherName || null,
        mother_name: form.motherName || null,
        requirements_data: form.requirementsData,
        requirements_type: form.requirementsType,
        requirements_name: form.requirementsName,
        appointment_date: form.appointmentDate,
        appointment_time: form.appointmentTime,
        payment_method: form.paymentMethod,
        receipt_data: form.receiptData,
        receipt_type: form.receiptType,
        receipt_name: form.receiptName,
        status: 'pending',
        payment_status: form.paymentMethod === 'gcash' ? 'unverified' : 'verified',
      };

      const { data, error: insertError } = await supabase
        .from('certificate_requests')
        .insert([requestData])
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message);
      }

      console.log('Request submitted:', data);

      // Create notification
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          message: `Your request for ${form.certificateType} certificate has been submitted. Awaiting review.`,
        },
      ]);

      // Show success state briefly, then navigate
      setShowConfirm(false);
      setSubmitted(true);

      setTimeout(() => {
        navigate('/user/dashboard');
      }, 1800);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.message || 'An unexpected error occurred');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Please login to request a certificate.</p>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="request-page">
        <div className="request-success">
          <div className="request-success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Request Submitted!</h2>
          <p>
            Your <strong>{form.certificateType}</strong> certificate request has been received. The parish
            office will review it shortly. You'll be notified by email when your request status updates.
          </p>
          <p className="request-success-redirect">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="request-page">
      <h2>Request a Certificate</h2>

      {error && (
        <div
          style={{
            color: '#8B1A1A',
            padding: '15px',
            background: '#FDE8E8',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #8B1A1A',
          }}
        >
          ❌ {error}
          <button
            onClick={() => setError('')}
            style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="request-page-grid">
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-section">
            <h3>Personal Details</h3>
            <p>Provide the details below so we can locate your records and process your request quickly.</p>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input name="dob" type="date" value={form.dob} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Certificate Type *</label>
                <select name="certificateType" value={form.certificateType} onChange={handleChange} disabled={loading}>
                  <option>Baptism</option>
                  <option>Confirmation</option>
                  <option>Marriage</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Family Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Father's Full Name</label>
                <input name="fatherName" value={form.fatherName} onChange={handleChange} disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Mother's Full Name</label>
                <input name="motherName" value={form.motherName} onChange={handleChange} disabled={loading} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Appointment & Documents</h3>
            <div className="form-group">
              <label className="form-label">Upload Requirements *</label>
              <input name="requirements" type="file" onChange={handleChange} required disabled={loading} />
              <small>Accepted formats: PDF, JPG, PNG.</small>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Appointment Date *</label>
                <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Appointment Time *</label>
                <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} required disabled={loading} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Options</h3>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="paymentMethod" value="cash" checked={form.paymentMethod === 'cash'} onChange={handleChange} disabled={loading} />
                  Cash on Pickup
                </label>
                <label>
                  <input type="radio" name="paymentMethod" value="gcash" checked={form.paymentMethod === 'gcash'} onChange={handleChange} disabled={loading} />
                  Online Payment (GCash)
                </label>
              </div>
            </div>
            {form.paymentMethod === 'gcash' && (
              <div className="form-group">
                <label className="form-label">Upload GCash Receipt *</label>
                <input name="receipt" type="file" onChange={handleChange} required disabled={loading} />
                <small>Please keep a copy for your records.</small>
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <aside className="request-sidebar">
          <h3>Request Checklist</h3>
          <p>Complete all mandatory fields before submission. Our parish office will confirm your appointment within 24 hours.</p>
          <ul>
            <li><strong>Full Name</strong> as it appears on record</li>
            <li><strong>Valid Email</strong> for notifications</li>
            <li><strong>Supporting documents</strong> uploaded clearly</li>
            <li><strong>Appointment details</strong> selected correctly</li>
          </ul>
          <p><strong>Need help?</strong> Visit the parish office or contact the administrator after login.</p>
        </aside>
      </div>

      {/* ===== REVIEW-BEFORE-SUBMIT CONFIRMATION MODAL ===== */}
      <ReviewConfirmModal
        isOpen={showConfirm}
        form={form}
        loading={loading}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmSubmit}
      />
    </div>
  );
}

/* ===== REVIEW CONFIRMATION MODAL (custom layout for request summary) ===== */
function ReviewConfirmModal({ isOpen, form, loading, onCancel, onConfirm }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, loading, onCancel]);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fileSizeLabel = (dataUrl) => {
    if (!dataUrl) return '—';
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    const bytes = (base64Length * 3) / 4;
    if (bytes < 1024) return `${bytes.toFixed(0)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="confirm-overlay" onClick={() => !loading && onCancel()}>
      <div
        className="confirm-modal confirm-primary request-review-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="confirm-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>

        <h3 className="confirm-title">Review your request</h3>
        <p className="confirm-message">
          Please verify the details below. Once submitted, our parish office will process your request.
        </p>

        <div className="request-review-body">
          <div className="request-review-grid">
            <div className="request-review-item">
              <span className="request-review-label">Full Name</span>
              <span className="request-review-value">{form.fullName || '—'}</span>
            </div>
            <div className="request-review-item">
              <span className="request-review-label">Email</span>
              <span className="request-review-value">{form.email || '—'}</span>
            </div>
            <div className="request-review-item">
              <span className="request-review-label">Certificate Type</span>
              <span className="request-review-value">{form.certificateType}</span>
            </div>
            <div className="request-review-item">
              <span className="request-review-label">Date of Birth</span>
              <span className="request-review-value">{form.dob || '—'}</span>
            </div>
            {form.fatherName && (
              <div className="request-review-item">
                <span className="request-review-label">Father's Name</span>
                <span className="request-review-value">{form.fatherName}</span>
              </div>
            )}
            {form.motherName && (
              <div className="request-review-item">
                <span className="request-review-label">Mother's Name</span>
                <span className="request-review-value">{form.motherName}</span>
              </div>
            )}
            <div className="request-review-item">
              <span className="request-review-label">Appointment</span>
              <span className="request-review-value">
                {form.appointmentDate} at {form.appointmentTime}
              </span>
            </div>
            <div className="request-review-item">
              <span className="request-review-label">Payment Method</span>
              <span className="request-review-value">
                {form.paymentMethod === 'gcash' ? 'GCash (Online)' : 'Cash on Pickup'}
              </span>
            </div>
          </div>

          <div className="request-review-files">
            <div className="request-review-file">
              <span className="request-review-file-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
              </span>
              <div className="request-review-file-body">
                <span className="request-review-file-name">{form.requirementsName || 'Requirements'}</span>
                <span className="request-review-file-meta">{fileSizeLabel(form.requirementsData)}</span>
              </div>
            </div>

            {form.paymentMethod === 'gcash' && form.receiptData && (
              <div className="request-review-file">
                <span className="request-review-file-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <div className="request-review-file-body">
                  <span className="request-review-file-name">{form.receiptName || 'GCash Receipt'}</span>
                  <span className="request-review-file-meta">{fileSizeLabel(form.receiptData)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="confirm-actions">
          <button className="confirm-btn confirm-cancel" onClick={onCancel} disabled={loading} type="button">
            Go Back & Edit
          </button>
          <button className="confirm-btn confirm-primary" onClick={onConfirm} disabled={loading} type="button">
            {loading ? 'Submitting…' : 'Confirm & Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}