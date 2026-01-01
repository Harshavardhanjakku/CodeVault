const crypto = require("crypto");

/**
 * ======================================================
 * ENV SAFETY CHECK (VERY IMPORTANT)
 * ======================================================
 * If MASTER_SECRET_KEY is missing, crash immediately.
 * This avoids silent 500 errors in production.
 */
if (!process.env.MASTER_SECRET_KEY) {
  throw new Error("❌ MASTER_SECRET_KEY is not set in environment variables");
}

/**
 * ======================================================
 * CONFIG
 * ======================================================
 */
const algorithm = "aes-256-cbc";

/**
 * Derive a fixed 32-byte key using SHA-256
 * Ensures consistent encryption/decryption across restarts
 */
const secretKey = crypto
  .createHash("sha256")
  .update(process.env.MASTER_SECRET_KEY)
  .digest();

/**
 * ======================================================
 * ENCRYPT
 * ======================================================
 * - Uses random IV per encryption
 * - Stores IV with ciphertext (iv:ciphertext)
 */
function encrypt(text) {
  if (!text) return "";

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

/**
 * ======================================================
 * DECRYPT
 * ======================================================
 */
function decrypt(encryptedText) {
  if (!encryptedText) return "";

  const parts = encryptedText.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = { encrypt, decrypt };
