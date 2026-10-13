// src/utils/downloadCertificate.js
import { generateCertificatePDF } from './generateCertificatePDF';
import { CERTIFICATE_CONFIGS, mapDetailsToFields } from './certificateConfigs';

/**
 * Generates and downloads a certificate PDF for the given request.
 *
 * Priority for field values:
 *   1. Admin's edited values (request.edited_details)
 *   2. User's original submission (request.details)
 *
 * Priority for field positions:
 *   1. Admin's per-request layout (request.layout)
 *   2. Default coordinates in certificateConfigs.js
 */
export async function downloadCertificate(request) {
  const config = CERTIFICATE_CONFIGS[request.certificate_type];
  if (!config) {
    throw new Error(`No template configured for "${request.certificate_type}"`);
  }

  // ✅ Prefer admin's edited details if they exist.
  //    Merge so untouched fields keep the user's original values.
  const sourceDetails =
    request.edited_details && Object.keys(request.edited_details).length > 0
      ? { ...request.details, ...request.edited_details }
      : request.details || {};

  const requestLayout = request.layout || {};

  let fields;

  if (Object.keys(requestLayout).length > 0) {
    // ---- Use admin's custom layout ----
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
    // ---- Fall back to config defaults ----
    const result = mapDetailsToFields(
      request.certificate_type,
      sourceDetails,
      request
    );
    fields = result?.fields || [];
  }

  // Build a clean filename based on the (possibly edited) name field
  const nameKey =
    sourceDetails.baptizedName ||
    sourceDetails.confirmedName ||
    sourceDetails.fullName ||
    sourceDetails.groomName ||
    request.user_name ||
    'certificate';
  const safeName = String(nameKey).replace(/[^a-z0-9]+/gi, '_');

  const filename = `${config.filenamePrefix}_${safeName}_${request.id}`;

  await generateCertificatePDF({
    imageSrc: config.imageSrc,
    imageWidth: config.imageWidth,
    imageHeight: config.imageHeight,
    fields,
    filename,
  });
}