// src/utils/certificateConfigs.js

// ============================================================
//  CERTIFICATE TEMPLATE IMPORTS
//  These load the 5 scanned certificate PNGs.
//  If a file is missing, the app falls back to placeholder.png
//  so the build never breaks.
// ============================================================

import placeholderImg from '../assets/certificate-templates/placeholder.png';
import noRecordImg from '../assets/certificate-templates/no-record.png';
import goodMoralImg from '../assets/certificate-templates/good-moral.png';
import baptismalImg from '../assets/certificate-templates/baptismal.png';
import confirmationImg from '../assets/certificate-templates/confirmation.png';
import marriageImg from '../assets/certificate-templates/marriage.png';

// ============================================================
//  CERTIFICATE CONFIGURATIONS
//
//  Each config defines:
//    - imageSrc      : the scanned certificate image
//    - imageWidth    : actual pixel width of the image
//    - imageHeight   : actual pixel height of the image
//    - filenamePrefix: what the downloaded PDF is named
//    - fields        : array of positions where text is overlaid
//
//  Field object shape:
//    {
//      key       : matches a key in the request's `details` JSON
//      x         : left (or center) x-coordinate in image pixels
//      y         : baseline y-coordinate in image pixels
//      fontSize  : pt size (usually 11–12 for certificates)
//      font      : 'times' | 'helvetica' | 'courier'
//      fontStyle : 'normal' | 'bold' | 'italic'   (optional)
//      align     : 'left' | 'center' | 'right'
//      maxWidth  : optional; wraps text if it exceeds this width
//    }
//
//  HOW TO MEASURE COORDINATES
//  1. Open the image in an editor (Photopea, Photoshop, GIMP).
//  2. Hover over where text should START — read (x, y) from the status bar.
//  3. y = baseline (bottom of letters, NOT top).
//  4. Update the values below.
// ============================================================

export const CERTIFICATE_CONFIGS = {
  // ------------------------------------------------------------
  //  CERTIFICATE OF NO RECORD
  // ------------------------------------------------------------
  'Certificate of No Record': {
    imageSrc: noRecordImg || placeholderImg,
    imageWidth: 640,
    imageHeight: 900,
    filenamePrefix: 'Certificate_of_No_Record',
    fields: [
      // Date: ____________   (top of the certificate)
      {
        key: 'date',
        x: 180,
        y: 305,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
      // "This is to certify that  ______  was not ______"
      {
        key: 'fullName',
        x: 340,
        y: 425,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // "...does not appear in our Book of  ______."
      {
        key: 'bookType',
        x: 555,
        y: 490,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
    ],
  },

  // ------------------------------------------------------------
  //  CERTIFICATE OF GOOD MORAL
  // ------------------------------------------------------------
  'Certificate of Good Moral': {
    imageSrc: goodMoralImg || placeholderImg,
    imageWidth: 640,
    imageHeight: 900,
    filenamePrefix: 'Certificate_of_Good_Moral',
    fields: [
      // "This is to certify that ______"
      {
        key: 'fullName',
        x: 200,
        y: 395,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 220,
      },
      // "...is the son/daughter of ______"
      {
        key: 'sonDaughterOf',
        x: 200,
        y: 445,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 220,
      },
      // "...for the purpose of taking a ______."
      {
        key: 'purpose',
        x: 300,
        y: 555,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // "Issued this ____ day of _____, _____ at ..."
      {
        key: 'day',
        x: 175,
        y: 640,
        fontSize: 11,
        font: 'times',
        align: 'center',
      },
      {
        key: 'month',
        x: 250,
        y: 640,
        fontSize: 11,
        font: 'times',
        align: 'center',
      },
      {
        key: 'year',
        x: 330,
        y: 640,
        fontSize: 11,
        font: 'times',
        align: 'center',
      },
    ],
  },

  // ------------------------------------------------------------
  //  BAPTISMAL CERTIFICATE
  // ------------------------------------------------------------
  'Baptismal Certificate': {
    imageSrc: baptismalImg || placeholderImg,
    imageWidth: 800,
    imageHeight: 1035,
    filenamePrefix: 'Baptismal_Certificate',
    fields: [
      // "NAME OF BAPTIZED ______"
      {
        key: 'baptizedName',
        x: 265,
        y: 425,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 350,
      },
      // "DATE OF BIRTH ______"
      {
        key: 'dateOfBirth',
        x: 265,
        y: 458,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
      // "PLACE OF BIRTH ______"
      {
        key: 'placeOfBirth',
        x: 560,
        y: 458,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // "FATHER ______"
      {
        key: 'fatherName',
        x: 265,
        y: 492,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // "MOTHER ______"
      {
        key: 'motherName',
        x: 560,
        y: 492,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // "ON ______"  (date of baptism)
      {
        key: 'dateOfBaptism',
        x: 420,
        y: 590,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
      // "THE SPONSORS BEING ______"
      {
        key: 'sponsors',
        x: 265,
        y: 640,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 450,
      },
      // "AND THE OFFICIATING MINISTER ______"
      {
        key: 'officiatingMinister',
        x: 265,
        y: 680,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 400,
      },
      // "DATE ISSUED ______"
      {
        key: 'dateIssued',
        x: 265,
        y: 718,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
      // "PURPOSE: ______"
      {
        key: 'purpose',
        x: 600,
        y: 718,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 180,
      },
      // Registry / Book / Page numbers
      {
        key: 'registryNo',
        x: 415,
        y: 758,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
      {
        key: 'bookNo',
        x: 415,
        y: 785,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
      {
        key: 'pageNo',
        x: 415,
        y: 812,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
    ],
  },

  // ------------------------------------------------------------
  //  CERTIFICATE OF CONFIRMATION
  // ------------------------------------------------------------
  'Certificate of Confirmation': {
    imageSrc: confirmationImg || placeholderImg,
    imageWidth: 1024,
    imageHeight: 780,
    filenamePrefix: 'Certificate_of_Confirmation',
    fields: [
      // First centered line: name of confirmed
      {
        key: 'confirmedName',
        x: 512,
        y: 250,
        fontSize: 12,
        font: 'times',
        align: 'center',
        maxWidth: 600,
      },
      // "at ______ [parish]"
      {
        key: 'parish',
        x: 512,
        y: 340,
        fontSize: 11,
        font: 'times',
        align: 'center',
        maxWidth: 600,
      },
      // "on ______ [date]"
      {
        key: 'dateOfConfirmation',
        x: 512,
        y: 410,
        fontSize: 11,
        font: 'times',
        align: 'center',
      },
      // "[sponsor/s]"
      {
        key: 'sponsor',
        x: 512,
        y: 480,
        fontSize: 11,
        font: 'times',
        align: 'center',
        maxWidth: 600,
      },
      // "[Father]" — left column
      {
        key: 'fatherName',
        x: 250,
        y: 540,
        fontSize: 11,
        font: 'times',
        align: 'center',
        maxWidth: 280,
      },
      // "[Mother]" — right column
      {
        key: 'motherName',
        x: 770,
        y: 540,
        fontSize: 11,
        font: 'times',
        align: 'center',
        maxWidth: 280,
      },
      // "Purpose: ______"
      {
        key: 'purpose',
        x: 320,
        y: 650,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 500,
      },
    ],
  },

  // ------------------------------------------------------------
  //  MARRIAGE CERTIFICATE
  // ------------------------------------------------------------
  'Marriage Certificate': {
    imageSrc: marriageImg || placeholderImg,
    imageWidth: 800,
    imageHeight: 1035,
    filenamePrefix: 'Marriage_Certificate',
    fields: [
      // Groom / Bride names — top row, two columns
      {
        key: 'groomName',
        x: 265,
        y: 425,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      {
        key: 'brideName',
        x: 560,
        y: 425,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // Date & Place of Marriage
      {
        key: 'dateOfMarriage',
        x: 265,
        y: 500,
        fontSize: 11,
        font: 'times',
        align: 'left',
      },
      {
        key: 'placeOfMarriage',
        x: 560,
        y: 500,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // Groom's parents
      {
        key: 'groomFather',
        x: 265,
        y: 540,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      {
        key: 'groomMother',
        x: 560,
        y: 540,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // Bride's parents
      {
        key: 'brideFather',
        x: 265,
        y: 578,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      {
        key: 'brideMother',
        x: 560,
        y: 578,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 200,
      },
      // Sponsors
      {
        key: 'sponsors',
        x: 265,
        y: 640,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 450,
      },
      // Officiating Minister
      {
        key: 'officiatingMinister',
        x: 265,
        y: 680,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 400,
      },
      // Purpose
      {
        key: 'purpose',
        x: 600,
        y: 718,
        fontSize: 11,
        font: 'times',
        align: 'left',
        maxWidth: 180,
      },
    ],
  },
};

// ============================================================
//  DETAILS → FIELDS MAPPER
//  Merges the user's submitted `details` JSON with each
//  template's field definitions, filling in values where the
//  keys match, and formatting dates nicely.
// ============================================================
export function mapDetailsToFields(certificateType, details, request) {
  const config = CERTIFICATE_CONFIGS[certificateType];
  if (!config) return null;

  const d = details || {};
  const now = new Date();
  const today = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Values available to any certificate
  const commonValues = {
    date: today,
    dateIssued: today,
    day: now.getDate(),
    month: now.toLocaleDateString('en-US', { month: 'long' }),
    year: now.getFullYear(),
  };

  const mapped = config.fields.map((field) => {
    let value = commonValues[field.key] ?? d[field.key] ?? '';

    // Format ISO date strings (2026-10-13) → "October 13, 2026"
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      try {
        value = new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        // leave as-is if parsing fails
      }
    }

    return { ...field, value };
  });

  return { config, fields: mapped };
}