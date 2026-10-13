// src/pages/user/RequestCertificate.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ConfirmModal from '../../components/ConfirmModal';

// ============================================================
//  CERTIFICATE CONFIGURATION
// ============================================================
const CERTIFICATE_TYPES = {
  'Certificate of No Record': {
    label: 'Certificate of No Record',
    description: 'Certifies that a person has no record in the parish book.',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., Juan Dela Cruz' },
      { name: 'sonDaughterOf', label: 'Son/Daughter of', type: 'text', required: true, placeholder: 'e.g., Pedro Dela Cruz & Maria Santos' },
      {
        name: 'bookType',
        label: 'Book to search for absence of record',
        type: 'select',
        required: true,
        options: ['Baptism', 'Confirmation', 'Marriage'],
      },
    ],
  },

  'Certificate of Good Moral': {
    label: 'Certificate of Good Moral',
    description: 'Certifies good moral character as a parishioner and youth organization member.',
    fields: [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., Juan Dela Cruz' },
      {
        name: 'sonDaughterOf',
        label: "Son/Daughter of (Parents' full names)",
        type: 'text',
        required: true,
        placeholder: 'e.g., Pedro Dela Cruz & Maria Santos',
      },
      {
        name: 'gkkMember',
        label: 'GKK / Parishioner Status',
        type: 'text',
        required: true,
        placeholder: 'e.g., Member of GKK San Isidro',
      },
      {
        name: 'youthOrg',
        label: 'Youth Organization (if any)',
        type: 'text',
        required: false,
        placeholder: 'e.g., Parish Youth Ministry',
      },
      {
        name: 'purpose',
        label: 'Purpose of Certification',
        type: 'text',
        required: true,
        placeholder: 'e.g., Scholarship application, Employment requirement',
      },
    ],
  },

  'Baptismal Certificate': {
    label: 'Baptismal Certificate',
    description: 'Official record of the Sacrament of Baptism.',
    fields: [
      { name: 'baptizedName', label: 'Name of Baptized', type: 'text', required: true, placeholder: 'e.g., Juan Dela Cruz' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true, placeholder: 'e.g., New Cebu, President Roxas, Cotabato' },
      { name: 'fatherName', label: "Father's Full Name", type: 'text', required: true, placeholder: 'e.g., Pedro Dela Cruz' },
      { name: 'motherName', label: "Mother's Full Name", type: 'text', required: true, placeholder: 'e.g., Maria Santos' },
      {
        name: 'sponsors',
        label: 'Sponsors (Ninong/Ninang)',
        type: 'textarea',
        required: true,
        placeholder: 'List the names of the sponsors, separated by commas',
      },
      {
        name: 'officiatingMinister',
        label: 'Officiating Minister',
        type: 'text',
        required: false,
        placeholder: 'e.g., Rev. Fr. Jonel P. Peroy, DCK',
      },
      { name: 'dateOfBaptism', label: 'Date of Baptism (if known)', type: 'date', required: false },
    ],
  },

  'Certificate of Confirmation': {
    label: 'Certificate of Confirmation',
    description: 'Official record of the Sacrament of Confirmation.',
    fields: [
      { name: 'confirmedName', label: 'Name of Confirmed', type: 'text', required: true, placeholder: 'e.g., Juan Dela Cruz' },
      { name: 'parish', label: 'Parish of Confirmation', type: 'text', required: true, placeholder: 'e.g., Our Lady of Fatima - Sta. Cruz Parish' },
      { name: 'dateOfConfirmation', label: 'Date of Confirmation', type: 'date', required: true },
      { name: 'sponsor', label: 'Sponsor(s)', type: 'text', required: true, placeholder: 'e.g., Pedro Dela Cruz' },
      { name: 'fatherName', label: "Father's Full Name", type: 'text', required: true, placeholder: 'e.g., Pedro Dela Cruz' },
      { name: 'motherName', label: "Mother's Full Name", type: 'text', required: true, placeholder: 'e.g., Maria Santos' },
      {
        name: 'purpose',
        label: 'Purpose of Certification',
        type: 'text',
        required: true,
        placeholder: 'e.g., Marriage requirement, Employment',
      },
    ],
  },

  'Marriage Certificate': {
    label: 'Marriage Certificate',
    description: 'Official record of the Sacrament of Holy Matrimony.',
    fields: [
      { name: 'groomName', label: "Groom's Full Name", type: 'text', required: true, placeholder: 'e.g., Juan Dela Cruz' },
      { name: 'brideName', label: "Bride's Full Name", type: 'text', required: true, placeholder: 'e.g., Maria Santos' },
      { name: 'dateOfMarriage', label: 'Date of Marriage', type: 'date', required: true },
      { name: 'placeOfMarriage', label: 'Place of Marriage', type: 'text', required: true, placeholder: 'e.g., Our Lady of Fatima - Sta. Cruz Parish, New Cebu' },
      { name: 'groomFather', label: "Groom's Father", type: 'text', required: true, placeholder: 'e.g., Pedro Dela Cruz' },
      { name: 'groomMother', label: "Groom's Mother", type: 'text', required: true, placeholder: 'e.g., Ana Dela Cruz' },
      { name: 'brideFather', label: "Bride's Father", type: 'text', required: true, placeholder: 'e.g., Jose Santos' },
      { name: 'brideMother', label: "Bride's Mother", type: 'text', required: true, placeholder: 'e.g., Rosa Santos' },
      {
        name: 'sponsors',
        label: 'Sponsors (Ninong/Ninang)',
        type: 'textarea',
        required: true,
        placeholder: 'List the names of the principal sponsors, separated by commas',
      },
      {
        name: 'officiatingMinister',
        label: 'Officiating Minister',
        type: 'text',
        required: false,
        placeholder: 'e.g., Rev. Fr. Jonel P. Peroy, DCK',
      },
      {
        name: 'purpose',
        label: 'Purpose of Certification',
        type: 'text',
        required: true,
        placeholder: 'e.g., Passport application, Employment requirement, Legal purposes',
      },
    ],
  },
};

const DEFAULT_TYPE = 'Baptismal Certificate';

// ------------------------------------------------------------
//  Derive legacy column values (for the NOT NULL columns in DB)
// ------------------------------------------------------------
function deriveLegacyFields(certificateType, formData, user) {
  const d = formData || {};
  const today = new Date().toISOString().split('T')[0];

  const fullName =
    d.fullName ||
    d.baptizedName ||
    d.confirmedName ||
    d.groomName ||
    user?.name ||
    'Unknown';

  const dob =
    d.dateOfBirth ||
    d.dateOfBaptism ||
    d.dateOfConfirmation ||
    d.dateOfMarriage ||
    today;

  const fatherName =
    d.fatherName || d.groomFather || d.brideFather || null;

  const motherName =
    d.motherName || d.groomMother || d.brideMother || null;

  return { fullName, dob, fatherName, motherName };
}

// ------------------------------------------------------------
//  Format a date string nicely for the review modal
// ------------------------------------------------------------
function formatDateForDisplay(val) {
  if (!val) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(val).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return val;
  } catch {
    return val;
  }
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function RequestCertificate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificateType, setCertificateType] = useState(DEFAULT_TYPE);
  const [formData, setFormData] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const [common, setCommon] = useState({
    email: '',
    appointmentDate: '',
    appointmentTime: '',
    paymentMethod: 'cash',
    requirements: null,
    requirementsData: null,
    requirementsType: null,
    requirementsName: null,
    receipt: null,
    receiptData: null,
    receiptType: null,
    receiptName: null,
  });

  // Prefill email
  useEffect(() => {
    if (user) {
      setCommon((prev) => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const readFileData = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCommonChange = async (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files?.[0]) {
      const file = files[0];
      const data = await readFileData(file);
      setCommon((prev) => ({
        ...prev,
        [name]: file,
        [`${name}Data`]: data,
        [`${name}Type`]: file.type,
        [`${name}Name`]: file.name,
      }));
      return;
    }
    setCommon((prev) => ({ ...prev, [name]: value }));
  };

  // Reset dynamic fields when certificate type changes
  useEffect(() => {
    setFormData({});
    setError('');
  }, [certificateType]);

  // ---- Step 1: User clicks Submit → validate + open confirmation ----
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!user?.id) {
      setError('You are not logged in. Please login again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const config = CERTIFICATE_TYPES[certificateType];

    for (const field of config.fields) {
      if (field.required && !formData[field.name]) {
        setError(`Please fill in "${field.label}".`);
        return;
      }
    }

    if (!common.email || !common.appointmentDate || !common.appointmentTime) {
      setError('Please complete the appointment and email fields.');
      return;
    }

    if (!common.requirementsData) {
      setError('Please upload the required documents.');
      return;
    }

    if (common.paymentMethod === 'gcash' && !common.receiptData) {
      setError('Please upload your GCash receipt.');
      return;
    }

    // All valid → show confirmation
    setShowConfirm(true);
  };

  // ---- Step 2: User confirms → actually save to DB ----
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

      const legacy = deriveLegacyFields(certificateType, formData, user);

      const requestData = {
        user_id: user.id,
        user_name: user.name || 'Unknown',
        email: common.email,
        certificate_type: certificateType,
        details: formData,

        // Legacy NOT NULL columns
        full_name: legacy.fullName,
        dob: legacy.dob,
        father_name: legacy.fatherName,
        mother_name: legacy.motherName,

        appointment_date: common.appointmentDate,
        appointment_time: common.appointmentTime,
        payment_method: common.paymentMethod,
        payment_status:
          common.paymentMethod === 'gcash' ? 'unverified' : 'verified',
        requirements_data: common.requirementsData,
        requirements_type: common.requirementsType,
        requirements_name: common.requirementsName,
        receipt_data: common.receiptData,
        receipt_type: common.receiptType,
        receipt_name: common.receiptName,
        status: 'pending',
      };

      const { error: insertError } = await supabase
        .from('certificate_requests')
        .insert([requestData])
        .select();

      if (insertError) throw new Error(insertError.message);

      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          message: `Your request for ${certificateType} has been submitted. Awaiting review.`,
        },
      ]);

      setShowConfirm(false);
      alert('✅ Request submitted successfully!');
      navigate('/user/dashboard');
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

  const config = CERTIFICATE_TYPES[certificateType];

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
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="request-page-grid">
        <form onSubmit={handleSubmit} className="request-form">
          {/* ===== Certificate Type Selector ===== */}
          <div className="form-section">
            <h3>Certificate Type</h3>
            <p>
              Select the certificate you need. The form below will adjust to the
              required information.
            </p>

            <div className="form-group">
              <label className="form-label">Certificate *</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                disabled={loading}
              >
                {Object.keys(CERTIFICATE_TYPES).map((key) => (
                  <option key={key} value={key}>
                    {CERTIFICATE_TYPES[key].label}
                  </option>
                ))}
              </select>
              <small>{config.description}</small>
            </div>
          </div>

          {/* ===== Dynamic Fields ===== */}
          <div className="form-section">
            <h3>Information for the Certificate</h3>
            <p>
              These details will be printed on your{' '}
              {config.label.toLowerCase()}. Please ensure accuracy.
            </p>

            {config.fields.map((field) => (
              <div className="form-group" key={field.name}>
                <label className="form-label">
                  {field.label} {field.required && '*'}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleFieldChange}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                    disabled={loading}
                    rows={3}
                    className="form-textarea"
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleFieldChange}
                    required={field.required}
                    disabled={loading}
                  >
                    <option value="">Select…</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleFieldChange}
                    placeholder={field.placeholder || ''}
                    required={field.required}
                    disabled={loading}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ===== Contact / Appointment ===== */}
          <div className="form-section">
            <h3>Appointment & Contact</h3>
            <p>
              We'll notify you by email once your certificate is ready for pick
              up.
            </p>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                name="email"
                type="email"
                value={common.email}
                onChange={handleCommonChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Appointment Date *</label>
                <input
                  name="appointmentDate"
                  type="date"
                  value={common.appointmentDate}
                  onChange={handleCommonChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Appointment Time *</label>
                <input
                  name="appointmentTime"
                  type="time"
                  value={common.appointmentTime}
                  onChange={handleCommonChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Requirements *</label>
              <input
                name="requirements"
                type="file"
                onChange={handleCommonChange}
                required
                disabled={loading}
              />
              <small>Accepted formats: PDF, JPG, PNG.</small>
            </div>
          </div>

          {/* ===== Payment ===== */}
          <div className="form-section">
            <h3>Payment Options</h3>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={common.paymentMethod === 'cash'}
                    onChange={handleCommonChange}
                    disabled={loading}
                  />
                  Cash on Pickup
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash"
                    checked={common.paymentMethod === 'gcash'}
                    onChange={handleCommonChange}
                    disabled={loading}
                  />
                  Online Payment (GCash)
                </label>
              </div>
            </div>

            {common.paymentMethod === 'gcash' && (
              <div className="form-group">
                <label className="form-label">Upload GCash Receipt *</label>
                <input
                  name="receipt"
                  type="file"
                  onChange={handleCommonChange}
                  required
                  disabled={loading}
                />
                <small>Please keep a copy for your records.</small>
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        {/* ===== Sidebar ===== */}
        <aside className="request-sidebar">
          <h3>You are requesting</h3>
          <div className="request-sidebar-badge">{config.label}</div>
          <p>{config.description}</p>

          <h3 style={{ marginTop: '1.5rem' }}>Fields included</h3>
          <ul>
            {config.fields.map((f) => (
              <li key={f.name}>
                <strong>{f.label}</strong>
                {f.required ? ' — required' : ' — optional'}
              </li>
            ))}
          </ul>

          <p style={{ marginTop: '1.5rem' }}>
            <strong>Need help?</strong> Visit the parish office or contact the
            administrator after login.
          </p>
        </aside>
      </div>

      {/* ===== SUBMIT CONFIRMATION MODAL ===== */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Submit this request?"
        message="Please review the details below. Once submitted, your request will be sent to the parish office for review."
        confirmLabel="Yes, Submit Request"
        cancelLabel="Go Back & Edit"
        variant="primary"
        icon="check"
        loading={loading}
        onConfirm={confirmSubmit}
        onCancel={() => !loading && setShowConfirm(false)}
        customBody={
          <SubmitReviewBody
            certificateType={certificateType}
            fields={config.fields}
            formData={formData}
            common={common}
          />
        }
      />
    </div>
  );
}

/* ============================================================
   SUBMIT REVIEW BODY
   Shows a summary of everything before submission
   ============================================================ */
function SubmitReviewBody({ certificateType, fields, formData, common }) {
  return (
    <div className="submit-review">
      {/* Certificate type */}
      <div className="submit-review-section">
        <div className="submit-review-row">
          <span className="submit-review-label">Certificate</span>
          <span className="submit-review-value">{certificateType}</span>
        </div>
      </div>

      {/* Dynamic fields */}
      <div className="submit-review-section">
        {fields.map((field) => {
          const value = formData[field.name];
          if (!value) return null;
          const displayValue =
            field.type === 'date' ? formatDateForDisplay(value) : value;
          return (
            <div className="submit-review-row" key={field.name}>
              <span className="submit-review-label">{field.label}</span>
              <span className="submit-review-value">{displayValue}</span>
            </div>
          );
        })}
      </div>

      {/* Appointment + contact */}
      <div className="submit-review-section">
        <div className="submit-review-row">
          <span className="submit-review-label">Email</span>
          <span className="submit-review-value">{common.email}</span>
        </div>
        <div className="submit-review-row">
          <span className="submit-review-label">Appointment</span>
          <span className="submit-review-value">
            {formatDateForDisplay(common.appointmentDate)} at{' '}
            {common.appointmentTime}
          </span>
        </div>
        <div className="submit-review-row">
          <span className="submit-review-label">Payment</span>
          <span className="submit-review-value">
            {common.paymentMethod === 'gcash'
              ? 'Online Payment (GCash)'
              : 'Cash on Pickup'}
          </span>
        </div>
        {common.requirementsName && (
          <div className="submit-review-row">
            <span className="submit-review-label">Requirements</span>
            <span className="submit-review-value">
              {common.requirementsName}
            </span>
          </div>
        )}
        {common.paymentMethod === 'gcash' && common.receiptName && (
          <div className="submit-review-row">
            <span className="submit-review-label">GCash Receipt</span>
            <span className="submit-review-value">{common.receiptName}</span>
          </div>
        )}
      </div>
    </div>
  );
}