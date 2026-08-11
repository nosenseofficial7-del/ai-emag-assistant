import crypto from 'crypto';

const SECRET_SALT = 'NoSense2026SecureSaltKeygen';

/**
 * Validates a product activation key offline using cryptographic checksums.
 * @param {string} key Activation key (format: XXXX-XXXX-XXXX-XXXX)
 * @returns {boolean} True if the key is valid
 */
export function validateKey(key) {
  if (!key || typeof key !== 'string') return false;
  
  const cleanKey = key.toUpperCase().trim();
  const parts = cleanKey.split('-');
  
  let segments = [];
  if (parts.length === 4) {
    segments = parts;
  } else if (cleanKey.replace(/-/g, '').length === 16) {
    const raw = cleanKey.replace(/-/g, '');
    segments = [
      raw.substring(0, 4),
      raw.substring(4, 8),
      raw.substring(8, 12),
      raw.substring(12, 16)
    ];
  } else {
    return false;
  }

  // Validate each segment length
  if (segments.some(s => s.length !== 4)) return false;

  const s1s2s3 = segments[0] + segments[1] + segments[2];
  
  // Re-generate the expected checksum signature (first 4 hex chars of HMAC-SHA256)
  const expectedHash = crypto.createHmac('sha256', SECRET_SALT)
    .update(s1s2s3)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
    
  return segments[3] === expectedHash;
}

/**
 * Generates a valid cryptographic activation key.
 * @returns {string} Activation key
 */
export function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding ambiguous chars (0, 1, O, I)
  let s1s2s3 = '';
  for (let i = 0; i < 12; i++) {
    s1s2s3 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const hash = crypto.createHmac('sha256', SECRET_SALT)
    .update(s1s2s3)
    .digest('hex')
    .substring(0, 4)
    .toUpperCase();
    
  const key = [
    s1s2s3.substring(0, 4),
    s1s2s3.substring(4, 8),
    s1s2s3.substring(8, 12),
    hash
  ].join('-');
  
  return key;
}
