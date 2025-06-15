import crypto from 'crypto';

// Simple AES-256-CBC encryption
export const encryptMessage = (message, secretKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

// Simple AES-256-CBC decryption
export const decryptMessage = (encryptedData, secretKey) => {
  const [ivHex, encryptedText] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Generate encryption key from password
export const generateSecretKey = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
  return {
    key: key.toString('hex'),
    salt
  };
};

// Recreate key from password and salt
export const deriveSecretKey = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
};