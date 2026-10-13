// src/utils/generateCertificatePDF.js
import jsPDF from 'jspdf';

/**
 * Generates a filled certificate PDF from a template image + field coordinates.
 *
 * @param {Object} config
 * @param {string} config.imageSrc       - Path to the certificate template image
 * @param {number} config.imageWidth     - Template width in pixels
 * @param {number} config.imageHeight    - Template height in pixels
 * @param {Array}  config.fields         - Array of field definitions:
 *                                         [{ x, y, value, fontSize, align, maxWidth, font }]
 * @param {string} config.filename       - Output filename (without .pdf)
 */
export async function generateCertificatePDF({
  imageSrc,
  imageWidth,
  imageHeight,
  fields,
  filename = 'certificate',
}) {
  // Convert pixel dimensions to a PDF page size that preserves aspect ratio.
  // We use millimeters for the PDF, but keep the pixel coordinates as reference.
  const PX_PER_MM = 4; // Higher = sharper. Adjust if needed.
  const pageWidthMM = imageWidth / PX_PER_MM;
  const pageHeightMM = imageHeight / PX_PER_MM;

  const pdf = new jsPDF({
    orientation: pageWidthMM > pageHeightMM ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pageWidthMM, pageHeightMM],
  });

  // Embed the certificate background image
  const img = await loadImage(imageSrc);
  pdf.addImage(img, 'PNG', 0, 0, pageWidthMM, pageHeightMM, undefined, 'FAST');

  // Overlay text fields
  fields.forEach((field) => {
    if (!field.value) return;

    const xMM = field.x / PX_PER_MM;
    const yMM = field.y / PX_PER_MM;
    const fontSizePt = field.fontSize || 11;
    const font = field.font || 'times';
    const fontStyle = field.fontStyle || 'normal';

    pdf.setFont(font, fontStyle);
    pdf.setFontSize(fontSizePt);
    pdf.setTextColor(0, 0, 0);

    let textX = xMM;
    if (field.align === 'center') {
      textX = xMM; // We treat x as the center point
    } else if (field.align === 'right') {
      textX = xMM;
    }

    const options = {
      align: field.align || 'left',
      baseline: 'alphabetic',
      maxWidth: field.maxWidth ? field.maxWidth / PX_PER_MM : undefined,
    };

    pdf.text(String(field.value), textX, yMM, options);
  });

  pdf.save(`${filename}.pdf`);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}