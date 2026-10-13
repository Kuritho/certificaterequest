// src/components/CertificatePreviewModal.jsx
import { useEffect, useState, useRef } from 'react';
import { CERTIFICATE_CONFIGS, mapDetailsToFields } from '../utils/certificateConfigs';
import { downloadCertificate } from '../utils/downloadCertificate';
import ConfirmModal from './ConfirmModal';

export default function CertificatePreviewModal({
  isOpen,
  request,
  onClose,
  allowAnyStatus = false, // admin passes true; user leaves as false
}) {
  const [downloading, setDownloading] = useState(false);
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [renderInfo, setRenderInfo] = useState(null);
  const previewRef = useRef(null);

  // Approval check — allowed for admins at any status, restricted for users
  const isApproved = allowAnyStatus
    ? true
    : request?.status === 'ready' || request?.status === 'completed';

  // ---- Build render info (config + fields) ----
  useEffect(() => {
    if (!isOpen || !request) {
      setRenderInfo(null);
      return;
    }
    if (!isApproved) {
      setRenderInfo(null);
      return;
    }

    const config = CERTIFICATE_CONFIGS[request.certificate_type];
    if (!config) {
      setRenderInfo(null);
      return;
    }

    // ✅ Prefer admin's edited details if they exist.
    //    Merge so that fields the admin didn't touch still show the user's values.
    const sourceDetails =
      request.edited_details && Object.keys(request.edited_details).length > 0
        ? { ...request.details, ...request.edited_details }
        : request.details || {};

    const requestLayout = request.layout || {};

    let fields;

    if (Object.keys(requestLayout).length > 0) {
      // Use the admin's saved layout
      fields = Object.entries(sourceDetails)
        .filter(([key, value]) => value && requestLayout[key])
        .map(([key, value]) => ({
          key,
          value,
          x: requestLayout[key].x,
          y: requestLayout[key].y,
          fontSize: requestLayout[key].fontSize || 11,
          font: requestLayout[key].font || 'times',
          align: requestLayout[key].align || 'left',
          maxWidth: requestLayout[key].maxWidth || null,
          fontStyle: requestLayout[key].fontStyle || 'normal',
        }));
    } else {
      // Fall back to config defaults
      const result = mapDetailsToFields(
        request.certificate_type,
        sourceDetails,
        request
      );
      fields = result?.fields || [];
    }

    setRenderInfo({ config, fields });
  }, [isOpen, request, isApproved]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape' && !downloading) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, downloading, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  const handleDownload = async () => {
    if (!request) return;
    setDownloading(true);
    try {
      await downloadCertificate(request);
      setConfirmDownload(false);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
      setConfirmDownload(false);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen || !request) return null;

  const PREVIEW_MAX_WIDTH = 700;
  const scale = renderInfo
    ? Math.min(1, PREVIEW_MAX_WIDTH / renderInfo.config.imageWidth)
    : 1;

  return (
    <>
      <div
        className="cert-preview-overlay"
        onClick={() => !downloading && onClose()}
      >
        <div
          className="cert-preview-shell"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="cert-preview-head">
            <div>
              <h3>{request.certificate_type || 'Certificate'}</h3>
              <p>
                Request #{request.id} — {request.user_name || 'Unknown'}
              </p>
            </div>
            <div className="cert-preview-actions">
              <button
                className="cert-btn cert-btn-secondary"
                onClick={onClose}
                disabled={downloading}
                type="button"
              >
                Close
              </button>
              <button
                className="cert-btn cert-btn-primary"
                onClick={() => setConfirmDownload(true)}
                disabled={downloading || !renderInfo || !isApproved}
                type="button"
              >
                {downloading ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          </header>

          {!isApproved ? (
            <div className="cert-preview-empty">
              <p>🔒 Your certificate is not yet available.</p>
              <p>
                Please wait until the parish office marks your request as{' '}
                <strong>Ready for Pickup</strong> or <strong>Completed</strong>.
              </p>
            </div>
          ) : !renderInfo ? (
            <div className="cert-preview-empty">
              <p>No template configured for "{request.certificate_type}".</p>
            </div>
          ) : (
            <div className="cert-preview-scroll">
              <div
                className="cert-preview-stage"
                ref={previewRef}
                style={{
                  width: renderInfo.config.imageWidth * scale,
                  height: renderInfo.config.imageHeight * scale,
                }}
              >
                <img
                  src={renderInfo.config.imageSrc}
                  alt="Certificate template"
                  className="cert-preview-image"
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />

                {renderInfo.fields.map((field, idx) => {
                  if (!field.value) return null;
                  return (
                    <span
                      key={idx}
                      className="cert-preview-text"
                      style={{
                        left: field.x * scale,
                        top: field.y * scale,
                        fontSize: `${field.fontSize * scale}pt`,
                        textAlign: field.align || 'left',
                        maxWidth: field.maxWidth
                          ? field.maxWidth * scale
                          : undefined,
                        fontFamily:
                          field.font === 'times'
                            ? '"Times New Roman", Times, serif'
                            : field.font === 'helvetica'
                            ? 'Arial, Helvetica, sans-serif'
                            : field.font === 'courier'
                            ? '"Courier New", Courier, monospace'
                            : 'inherit',
                        fontWeight: field.fontStyle === 'bold' ? 700 : 500,
                        fontStyle:
                          field.fontStyle === 'italic' ? 'italic' : 'normal',
                      }}
                    >
                      {field.value}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Download confirmation ===== */}
      <ConfirmModal
        isOpen={confirmDownload}
        title="Download this certificate?"
        message="The PDF will be generated using the official parish template with this request's information filled in."
        confirmLabel="Yes, Download PDF"
        cancelLabel="Review Again"
        variant="primary"
        icon="info"
        loading={downloading}
        onConfirm={handleDownload}
        onCancel={() => setConfirmDownload(false)}
        zIndex={4500} // ← renders above the certificate preview modal
      />
    </>
  );
}