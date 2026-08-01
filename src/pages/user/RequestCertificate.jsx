import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RequestCertificate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user.name,
    email: user.email,
    certificateType: 'Baptism',
    dob: '',
    fatherName: '',
    motherName: '',
    requirements: null,
    requirementsData: null,
    requirementsType: null,
    appointmentDate: '',
    appointmentTime: '',
    paymentMethod: 'cash',
    receipt: null,
    receiptData: null,
    receiptType: null,
  });

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
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requests = JSON.parse(localStorage.getItem('sacramental_requests') || '[]');
    const newRequest = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      ...form,
      requirements: form.requirements ? {
        name: form.requirements.name,
        type: form.requirementsType,
        data: form.requirementsData,
      } : null,
      receipt: form.receipt ? {
        name: form.receipt.name,
        type: form.receiptType,
        data: form.receiptData,
      } : null,
      status: 'pending',
      paymentStatus: 'unverified',
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    localStorage.setItem('sacramental_requests', JSON.stringify(requests));

    // Simulate email notification
    const notif = JSON.parse(localStorage.getItem('sacramental_notifications') || '[]');
    notif.push({
      userId: user.id,
      message: `Your request for ${form.certificateType} certificate has been submitted. Awaiting review.`,
      date: new Date().toISOString()
    });
    localStorage.setItem('sacramental_notifications', JSON.stringify(notif));

    alert('✅ Request submitted successfully! (Simulated email notification sent)');
    navigate('/user/dashboard');
  };

  return (
    <div className="request-page">
      <h2>Request a Certificate</h2>
      <div className="request-page-grid">
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-section">
            <h3>Personal Details</h3>
            <p>Provide the details below so we can locate your records and process your request quickly.</p>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input name="dob" type="date" value={form.dob} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Certificate Type *</label>
                <select name="certificateType" value={form.certificateType} onChange={handleChange}>
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
                <input name="fatherName" value={form.fatherName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Mother's Full Name</label>
                <input name="motherName" value={form.motherName} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Appointment & Documents</h3>
            <div className="form-group">
              <label className="form-label">Upload Requirements *</label>
              <input name="requirements" type="file" onChange={handleChange} required />
              <small>Accepted formats: PDF, JPG, PNG.</small>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Appointment Date *</label>
                <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Appointment Time *</label>
                <input name="appointmentTime" type="time" value={form.appointmentTime} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Options</h3>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="paymentMethod" value="cash" checked={form.paymentMethod === 'cash'} onChange={handleChange} />
                  Cash on Pickup
                </label>
                <label>
                  <input type="radio" name="paymentMethod" value="gcash" checked={form.paymentMethod === 'gcash'} onChange={handleChange} />
                  Online Payment (GCash)
                </label>
              </div>
            </div>
            {form.paymentMethod === 'gcash' && (
              <div className="form-group">
                <label className="form-label">Upload GCash Receipt *</label>
                <input name="receipt" type="file" onChange={handleChange} required />
                <small>Please keep a copy for your records.</small>
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn">Submit Request</button>
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