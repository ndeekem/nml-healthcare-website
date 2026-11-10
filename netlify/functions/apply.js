
'use strict';

// NML Healthcare Services LLC — Careers application intake
// Netlify Function: netlify/functions/apply.js

const MAX_BODY_BYTES = 40000;
const MAX_DEPTH = 8;
const MAX_FIELDS = 250;

const EMPLOYMENT_TYPES = new Set([
  'Full-time',
  'Part-time',
  'Per diem',
  'Temporary'
]);

const BLOCKED_FIELDS = new Set([
  'ssn',
  'socialsecurity',
  'socialsecuritynumber',
  'dateofbirth',
  'birthdate',
  'dob',
  'driverslicense',
  'driverlicense',
  'driverslicensenumber',
  'criminalhistory'
]);

function respond(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(data)
  };
}

function cleanString(value, max = 200) {
  return typeof value === 'string'
    ? value.trim().slice(0, max)
    : '';
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sanitize(value, depth = 0, counter = { count: 0 }) {
  if (depth > MAX_DEPTH) {
    throw new Error('Application data is too deeply nested');
  }

  if (typeof value === 'string') {
    return cleanString(value, 1500);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Invalid numeric value');
    }
    return value;
  }

  if (typeof value === 'boolean' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length > 40) {
      throw new Error('Too many entries');
    }

    return value.map(item =>
      sanitize(item, depth + 1, counter)
    );
  }

  if (value && typeof value === 'object') {
    const result = {};

    for (const [key, item] of Object.entries(value)) {
      counter.count++;

      if (counter.count > MAX_FIELDS) {
        throw new Error('Too many application fields');
      }

      if (BLOCKED_FIELDS.has(normalizeKey(key))) {
        throw new Error('Sensitive identity field not accepted');
      }

      if (key === 'website') {
        continue;
      }

      result[key] = sanitize(
        item,
        depth + 1,
        counter
      );
    }

    return result;
  }

  throw new Error('Unsupported application data');
}

function checked(value) {
  return Array.isArray(value) &&
    value.includes('on');
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return respond(405, {
      error: 'Method not allowed'
    });
  }

  const body = event.body || '';

  if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
    return respond(413, {
      error: 'Application exceeds size limit'
    });
  }

  let data;

  try {
    data = JSON.parse(body);
  } catch {
    return respond(400, {
      error: 'Invalid application'
    });
  }

  if (!data || typeof data !== 'object' ||
      Array.isArray(data)) {
    return respond(400, {
      error: 'Invalid application format'
    });
  }

  // Honeypot: do not store submissions that fill
  // the hidden website field.
  if (data.website) {
    return respond(200, {
      ok: true,
      reference: 'RECEIVED'
    });
  }

  const firstName = cleanString(data.firstName, 80);
  const lastName = cleanString(data.lastName, 80);
  const email = cleanString(data.email, 150);
  const phone = cleanString(data.cellPhone, 30);
  const role = cleanString(data.role, 80);

  if (
    !firstName ||
    !lastName ||
    !validEmail(email) ||
    !phone ||
    !role ||
    !EMPLOYMENT_TYPES.has(data.employmentType) ||
    !['Yes', 'No'].includes(data.workAuthorized) ||
    !cleanString(data.typedSignature, 200) ||
    !checked(data.acknowledge) ||
    !checked(data.verifyEmployment) ||
    !checked(data.privacyConsent)
  ) {
    return respond(400, {
      error: 'Please complete all required information and acknowledgments'
    });
  }

  let application;

  try {
    application = sanitize(data);
  } catch {
    return respond(400, {
      error: 'Application contains unsupported or sensitive fields'
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return respond(503, {
      error: 'Employment applications are not yet accepting submissions'
    });
  }

  const reference =
    'NML-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    require('crypto').randomBytes(5).toString('hex').toUpperCase();

  const record = {
    reference,
    first_name: firstName,
    last_name: lastName,
    email,
    role,
    employment_type: data.employmentType,
    application,
    status: 'Applied'
  };

  try {
    const endpoint =
      supabaseUrl.replace(/\/$/, '') +
      '/rest/v1/nml_applications';

    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(record)
    });

    if (!result.ok) {
      console.error(
        'Application database insert failed',
        result.status
      );

      return respond(503, {
        error: 'Application service temporarily unavailable'
      });
    }

    return respond(201, {
      ok: true,
      reference
    });

  } catch {
    console.error('Application intake unavailable');

    return respond(503, {
      error: 'Application service temporarily unavailable'
    });
  }
};
