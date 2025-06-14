import nacl from 'tweetnacl';
import sodium from 'libsodium-wrappers';
import crypto from 'crypto';

await sodium.ready;
const toBase64 = sodium.to_base64;
const fromBase64 = sodium.from_base64;

const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: toBase64(keyPair.publicKey),
    secretKey: toBase64(keyPair.secretKey)
  };
};

const encryptPrivateKey = (privateKey, password, salt) => {
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

const decryptPrivateKey = (encryptedData, password, salt) => {
  const [ivHex, encryptedKey] = encryptedData.split(':');
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const encryptMessage = async (message, recipientPublicKey, senderPrivateKey) => {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const encrypted = sodium.crypto_box_easy(
    message,
    nonce,
    fromBase64(recipientPublicKey),
    fromBase64(senderPrivateKey)
  );
  return {
    nonce: toBase64(nonce),
    ciphertext: toBase64(encrypted)
  };
};

const decryptMessage = async (encryptedData, senderPublicKey, recipientPrivateKey) => {
  const { nonce, ciphertext } = encryptedData;
  const decrypted = sodium.crypto_box_open_easy(
    fromBase64(ciphertext),
    fromBase64(nonce),
    fromBase64(senderPublicKey),
    fromBase64(recipientPrivateKey)
  );
  return Buffer.from(decrypted).toString(); // Ensure conversion from Uint8Array
};

export {
  generateKeyPair,
  encryptPrivateKey,
  decryptPrivateKey,
  encryptMessage,
  decryptMessage
};
