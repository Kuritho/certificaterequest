// src/pages/user/RequestCertificate.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function RequestCertificate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setForm(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const readFileData = (file) => new Promise((resolve, reject) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user is authenticated
      if (!user?.id) {
        setError('You are not logged in. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        setLoading(false);
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
        payment_status: form.paymentMethod === 'gcash' ? 'unverified' : 'verified'
      };

      // Insert the request
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
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          message: `Your request for ${form.certificateType} certificate has been submitted. Awaiting review.`
        }]);

      alert('✅ Request submitted successfully!');
      navigate('/user/dashboard');
      
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.message || 'An unexpected error occurred');
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

  return (
    <div className="request-page">
      <h2>Request a Certificate</h2>
      {error && (
        <div style={{ 
          color: '#8B1A1A', 
          padding: '15px', 
          background: '#FDE8E8', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #8B1A1A'
        }}>
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
          {/* Form sections - same as before */}
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
    </div>
  );
}