// src/pages/admin/LayoutEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CERTIFICATE_CONFIGS } from '../../utils/certificateConfigs';

// Field label map
const FIELD_LABELS = {
  fullName: 'Full Name',
  sonDaughterOf: 'Son/Daughter of',
  bookType: 'Book Type',
  gkkMember: 'GKK Status',
  youthOrg: 'Youth Org',
  purpose: 'Purpose',
  baptizedName: 'Name of Baptized',
  dateOfBirth: 'Date of Birth',
  placeOfBirth: 'Place of Birth',
  fatherName: "Father's Name",
  motherName: "Mother's Name",
  sponsors: 'Sponsors',
  officiatingMinister: 'Officiating Minister',
  dateOfBaptism: 'Date of Baptism',
  confirmedName: 'Name of Confirmed',
  parish: 'Parish',
  dateOfConfirmation: 'Date of Confirmation',
  sponsor: 'Sponsor(s)',
  groomName: "Groom's Name",
  brideName: "Bride's Name",
  dateOfMarriage: 'Date of Marriage',
  placeOfMarriage: 'Place of Marriage',
  groomFather: "Groom's Father",
  groomMother: "Groom's Mother",
  brideFather: "Bride's Father",
  brideMother: "Bride's Mother",
  dateIssued: 'Date Issued',
  registryNo: 'Registry No.',
  bookNo: 'Book No.',
  pageNo: 'Page No.',
  date: 'Date',
  day: 'Day',
  month: 'Month',
  year: 'Year',
};

export default function LayoutEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // The working copy of the details — starts from edited_details
  // (if present) or falls back to the user's original details.
  const [details, setDetails] = useState({});
  // Layout positions per field
  const [layout, setLayout] = useState({});

  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);

  // Editing state
  const [editingKey, setEditingKey] = useState(null); // which field value is being edited
  const [editingValue, setEditingValue] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  // ---- Load request ----
  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificate_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRequest(data);

      // Merge: prefer edited_details if present, else original details
      const sourceDetails =
        data.edited_details && Object.keys(data.edited_details).length > 0
          ? { ...data.details, ...data.edited_details }
          : data.details || {};

      setDetails(sourceDetails);

      // Load layout or generate from template/defaults
      const config = CERTIFICATE_CONFIGS[data.certificate_type];
      let initialLayout = {};

      if (data.layout) {
        initialLayout = data.layout;
      } else {
        const { data: template } = await supabase
          .from('certificate_layout_templates')
          .select('layout')
          .eq('certificate_type', data.certificate_type)
          .maybeSingle();

        if (template?.layout) {
          initialLayout = template.layout;
        } else if (config) {
          config.fields.forEach((f) => {
            initialLayout[f.key] = {
              x: f.x,
              y: f.y,
              fontSize: f.fontSize || 11,
              font: f.font || 'times',
              align: f.align || 'left',
              maxWidth: f.maxWidth || null,
            };
          });
        }
      }

      // Ensure every key in details has a layout entry
      Object.keys(sourceDetails).forEach((key) => {
        if (!initialLayout[key] && sourceDetails[key]) {
          initialLayout[key] = {
            x: 100,
            y: 100,
            fontSize: 11,
            font: 'times',
            align: 'left',
            maxWidth: null,
          };
        }
      });

      setLayout(initialLayout);
    } catch (err) {
      console.error('Failed to load request:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const config = request ? CERTIFICATE_CONFIGS[request.certificate_type] : null;

  // ---- Drag logic ----
  const handleMouseDown = (e, fieldKey) => {
    if (editingKey === fieldKey) return; // don't drag while editing
    e.preventDefault();
    setDragging({
      fieldKey,
      offsetX: e.clientX,
      offsetY: e.clientY,
      startX: layout[fieldKey].x,
      startY: layout[fieldKey].y,
    });
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      const img = containerRef.current?.querySelector('.layout-editor-image');
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const scaleX = (config?.imageWidth || 1) / rect.width;
      const scaleY = (config?.imageHeight || 1) / rect.height;

      const dx = (e.clientX - dragging.offsetX) * scaleX;
      const dy = (e.clientY - dragging.offsetY) * scaleY;

      setLayout((prev) => ({
        ...prev,
        [dragging.fieldKey]: {
          ...prev[dragging.fieldKey],
          x: Math.round(dragging.startX + dx),
          y: Math.round(dragging.startY + dy),
        },
      }));
    };

    const handleUp = () => setDragging(null);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, config]);

  const updateFieldLayout = (key, patch) => {
    setLayout((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  // ---- Edit a value ----
  const startEdit = (key) => {
    setEditingKey(key);
    setEditingValue(details[key] || '');
  };

  const saveEdit = () => {
    if (!editingKey) return;
    setDetails((prev) => ({ ...prev, [editingKey]: editingValue }));
    setEditingKey(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingValue('');
  };

  // ---- Delete a field ----
  const deleteField = (key) => {
    if (!window.confirm(`Remove "${FIELD_LABELS[key] || key}" from the certificate?`)) return;
    setDetails((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setLayout((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (selected === key) setSelected(null);
    if (editingKey === key) cancelEdit();
  };

  // ---- Add a new field ----
  const addField = () => {
    const key = newFieldKey.trim();
    if (!key) {
      alert('Enter a field key (e.g., additionalInfo).');
      return;
    }
    if (details[key] !== undefined) {
      alert('That field already exists. Edit it instead.');
      return;
    }
    setDetails((prev) => ({ ...prev, [key]: newFieldValue }));
    setLayout((prev) => ({
      ...prev,
      [key]: {
        x: 200,
        y: 200,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: null,
      },
    }));
    setNewFieldKey('');
    setNewFieldValue('');
    setShowAddField(false);
    setSelected(key);
  };

  // ---- Save ----
  const handleSave = async (alsoSaveAsTemplate = false) => {
    setSaving(true);
    try {
      const { error: updateErr } = await supabase
        .from('certificate_requests')
        .update({
          layout,
          edited_details: details,
        })
        .eq('id', id);
      if (updateErr) throw updateErr;

      if (alsoSaveAsTemplate && request) {
        await supabase
          .from('certificate_layout_templates')
          .upsert(
            {
              certificate_type: request.certificate_type,
              layout,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'certificate_type' }
          );
      }

      alert('✅ Layout & content saved successfully!');
      navigate('/admin/review');
    } catch (err) {
      console.error('Save failed:', err);
      alert('❌ Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const scale = config ? Math.min(1, 900 / config.imageWidth) : 1;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-ring"></div>
        <p>Loading layout editor…</p>
      </div>
    );
  }

  if (error || !request || !config) {
    return (
      <div className="dashboard-error">
        <p>Could not load the layout editor.</p>
        <p className="error-detail">{error || 'Request or template missing.'}</p>
        <button onClick={() => navigate('/admin/review')}>Back to Review</button>
      </div>
    );
  }

  return (
    <div className="layout-editor-page">
      {/* ===== Header ===== */}
      <header className="layout-editor-header">
        <div>
          <h1>Layout & Content Editor</h1>
          <p>
            {request.certificate_type} — Request #{request.id} ({request.user_name})
          </p>
        </div>
        <div className="layout-editor-actions">
          <button
            className="layout-btn layout-btn-secondary"
            onClick={() => navigate('/admin/review')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="layout-btn layout-btn-secondary"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save as Template'}
          </button>
          <button
            className="layout-btn layout-btn-primary"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      <div className="layout-editor-grid">
        {/* ===== Canvas ===== */}
        <div className="layout-editor-canvas-wrap">
          <p className="layout-editor-hint">
            💡 Drag labels to position them. Click a field in the sidebar to edit its text or remove it.
          </p>

          <div
            className="layout-editor-canvas"
            ref={containerRef}
            style={{
              width: config.imageWidth * scale,
              height: config.imageHeight * scale,
            }}
          >
            <img
              src={config.imageSrc}
              alt="Certificate template"
              className="layout-editor-image"
              draggable={false}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {Object.keys(details).map((key) => {
              const value = details[key];
              if (!value) return null;
              const pos = layout[key];
              if (!pos) return null;

              const isSelected = selected === key;
              const isDragging = dragging?.fieldKey === key;

              return (
                <div
                  key={key}
                  className={`layout-editor-chip ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
                  onMouseDown={(e) => handleMouseDown(e, key)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(key);
                  }}
                  style={{
                    left: pos.x * scale,
                    top: pos.y * scale,
                    fontSize: `${pos.fontSize * scale}pt`,
                    fontFamily:
                      pos.font === 'times'
                        ? '"Times New Roman", Times, serif'
                        : pos.font === 'helvetica'
                        ? 'Arial, sans-serif'
                        : 'inherit',
                    textAlign: pos.align || 'left',
                    maxWidth: pos.maxWidth ? pos.maxWidth * scale : undefined,
                  }}
                  title={`${FIELD_LABELS[key] || key}: ${value}`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Sidebar ===== */}
        <aside className="layout-editor-sidebar">
          <div className="layout-editor-sidebar-header">
            <h3>Fields ({Object.keys(details).length})</h3>
            <button
              className="layout-add-btn"
              onClick={() => setShowAddField(true)}
              title="Add a new field"
              type="button"
            >
              + Add
            </button>
          </div>

          <p className="layout-editor-sidebar-help">
            Click a field to select and edit it.
          </p>

          {/* ---- Add field form ---- */}
          {showAddField && (
            <div className="layout-add-form">
              <label>
                <span>Field Key</span>
                <input
                  type="text"
                  placeholder="e.g., additionalInfo"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                />
              </label>
              <label>
                <span>Value</span>
                <input
                  type="text"
                  placeholder="Text to display"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                />
              </label>
              <div className="layout-add-actions">
                <button
                  type="button"
                  className="layout-add-cancel"
                  onClick={() => {
                    setShowAddField(false);
                    setNewFieldKey('');
                    setNewFieldValue('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="layout-add-save"
                  onClick={addField}
                >
                  Add Field
                </button>
              </div>
            </div>
          )}

          {/* ---- Field list ---- */}
          <div className="layout-editor-list">
            {Object.entries(details).map(([key, value]) => {
              if (!value && value !== '') return null;
              const isSelected = selected === key;
              const isEditing = editingKey === key;

              return (
                <div
                  key={key}
                  className={`layout-editor-list-item ${isSelected ? 'selected' : ''}`}
                >
                  <div
                    className="layout-editor-list-main"
                    onClick={() => setSelected(key)}
                  >
                    <span className="layout-editor-list-label">
                      {FIELD_LABELS[key] || key}
                    </span>

                    {isEditing ? (
                      <input
                        type="text"
                        className="layout-editor-inline-input"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="layout-editor-list-value">{value}</span>
                    )}
                  </div>

                  <div className="layout-editor-list-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="layout-icon-btn save"
                          onClick={saveEdit}
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="layout-icon-btn"
                          onClick={cancelEdit}
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="layout-icon-btn"
                          onClick={() => startEdit(key)}
                          title="Edit value"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="layout-icon-btn danger"
                          onClick={() => deleteField(key)}
                          title="Remove field"
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---- Controls for selected field ---- */}
          {selected && layout[selected] && (
            <div className="layout-editor-controls">
              <h4>{FIELD_LABELS[selected] || selected}</h4>

              <label className="layout-editor-control">
                <span>Font Size</span>
                <input
                  type="range"
                  min="8"
                  max="24"
                  step="0.5"
                  value={layout[selected].fontSize || 11}
                  onChange={(e) =>
                    updateFieldLayout(selected, { fontSize: parseFloat(e.target.value) })
                  }
                />
                <span className="layout-editor-value">{layout[selected].fontSize}pt</span>
              </label>

              <label className="layout-editor-control">
                <span>X</span>
                <input
                  type="number"
                  value={layout[selected].x}
                  onChange={(e) =>
                    updateFieldLayout(selected, { x: parseInt(e.target.value) || 0 })
                  }
                />
              </label>

              <label className="layout-editor-control">
                <span>Y</span>
                <input
                  type="number"
                  value={layout[selected].y}
                  onChange={(e) =>
                    updateFieldLayout(selected, { y: parseInt(e.target.value) || 0 })
                  }
                />
              </label>

              <label className="layout-editor-control">
                <span>Align</span>
                <select
                  value={layout[selected].align || 'left'}
                  onChange={(e) => updateFieldLayout(selected, { align: e.target.value })}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>

              <button
                className="layout-editor-reset"
                onClick={() =>
                  setLayout((prev) => {
                    const defaultField = config?.fields.find((f) => f.key === selected);
                    if (!defaultField) return prev;
                    return {
                      ...prev,
                      [selected]: {
                        x: defaultField.x,
                        y: defaultField.y,
                        fontSize: defaultField.fontSize || 11,
                        font: defaultField.font || 'times',
                        align: defaultField.align || 'left',
                        maxWidth: defaultField.maxWidth || null,
                      },
                    };
                  })
                }
              >
                Reset Position
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}