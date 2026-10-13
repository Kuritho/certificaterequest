// src/pages/admin/CoordinatePicker.jsx
import { useState, useRef } from 'react';

export default function CoordinatePicker() {
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [points, setPoints] = useState([]);
  const [activeLabel, setActiveLabel] = useState('');
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      const img = new Image();
      img.onload = () => {
        setImage(src);
        setImageSize({ w: img.width, h: img.height });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleClick = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const scaleX = imageSize.w / rect.width;
    const scaleY = imageSize.h / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (!activeLabel.trim()) {
      alert('Type a field label first (e.g., fullName), then click on the certificate.');
      return;
    }

    setPoints((prev) => [
      ...prev.filter((p) => p.label !== activeLabel),
      { label: activeLabel.trim(), x, y },
    ]);
  };

  const handleRemove = (label) => {
    setPoints((prev) => prev.filter((p) => p.label !== label));
  };

  const generateCode = () => {
    const lines = points.map(
      (p) =>
        `      { key: '${p.label}', x: ${p.x}, y: ${p.y}, fontSize: 11, font: 'times', align: 'left' },`
    );
    return `fields: [\n${lines.join('\n')}\n    ],`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Certificate Coordinate Picker</h1>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Upload a certificate image, type a field label, then click where the text should start.
      </p>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <input
          type="text"
          placeholder="Field label (e.g., fullName, baptizedName)"
          value={activeLabel}
          onChange={(e) => setActiveLabel(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4, minWidth: 280 }}
        />
        <button
          onClick={() => setPoints([])}
          style={{ padding: '0.5rem 1rem', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Clear All
        </button>
      </div>

      {image && (
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            display: 'inline-block',
            cursor: 'crosshair',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          <img
            ref={imgRef}
            src={image}
            alt="Certificate"
            onClick={handleClick}
            style={{
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              border: '2px solid #333',
            }}
          />
          {points.map((p) => {
            const rect = imgRef.current?.getBoundingClientRect();
            if (!rect) return null;
            const displayX = (p.x / imageSize.w) * rect.width;
            const displayY = (p.y / imageSize.h) * rect.height;
            return (
              <div
                key={p.label}
                style={{
                  position: 'absolute',
                  left: displayX,
                  top: displayY,
                  transform: 'translate(-2px, -50%)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ width: 8, height: 8, background: 'red', borderRadius: '50%' }} />
                <span
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: -8,
                    background: 'red',
                    color: 'white',
                    padding: '1px 4px',
                    fontSize: 10,
                    borderRadius: 3,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {points.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Measured Coordinates</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
            Image size: {imageSize.w} × {imageSize.h} px
          </p>

          <table style={{ borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th style={th}>Field</th>
                <th style={th}>X</th>
                <th style={th}>Y</th>
                <th style={th}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.label}>
                  <td style={td}>{p.label}</td>
                  <td style={td}>{p.x}</td>
                  <td style={td}>{p.y}</td>
                  <td style={td}>
                    <button
                      onClick={() => handleRemove(p.label)}
                      style={{ background: '#fdd', border: 'none', borderRadius: 3, padding: '2px 6px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Paste into certificateConfigs.js:</h3>
          <pre
            style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1rem',
              borderRadius: 6,
              fontSize: 12,
              overflow: 'auto',
              userSelect: 'all',
            }}
          >
            {generateCode()}
          </pre>
        </div>
      )}
    </div>
  );
}

const th = { border: '1px solid #ccc', padding: '6px 12px', background: '#f5f5f5', textAlign: 'left', fontSize: 13 };
const td = { border: '1px solid #ccc', padding: '6px 12px', fontSize: 13 };