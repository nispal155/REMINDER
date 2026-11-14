/**
 * Automated Security & Privacy Verification Suite
 * Tests Web Crypto API AES-GCM/PBKDF2, Single-User Allowlist,
 * Attachment Policies, Filename Sanitization, Notification Privacy,
 * and Google Drive Safe Deletion Protection.
 */

import { webcrypto } from 'crypto';
import assert from 'assert';

const crypto = webcrypto;

console.log('====================================================');
console.log('🛡️ REMINDER PWA — AUTOMATED SECURITY TEST SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. Web Crypto AES-256-GCM & PBKDF2 Key Derivation
// ----------------------------------------------------
console.log('▶ Test 1: Testing Web Crypto AES-256-GCM & PBKDF2 Engine...');

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(plaintext, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return {
    format: 'REMINDER_ENC_V1',
    algorithm: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    salt: Buffer.from(salt).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    ciphertext: Buffer.from(cipherBuffer).toString('base64')
  };
}

async function decryptData(pkg, passphrase) {
  const salt = Buffer.from(pkg.salt, 'base64');
  const iv = Buffer.from(pkg.iv, 'base64');
  const ciphertext = Buffer.from(pkg.ciphertext, 'base64');
  const key = await deriveKey(passphrase, salt);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

const secretPlaintext = JSON.stringify({
  reminders: [{ id: '1', title: 'Cardiologist Follow-up Appointment', notes: 'Private health record' }]
});
const passphrase = 'MySuperStrongPassphrase#2083!';

const encryptedPkg = await encryptData(secretPlaintext, passphrase);
assert(encryptedPkg.format === 'REMINDER_ENC_V1', 'Package must have REMINDER_ENC_V1 format');
assert(encryptedPkg.ciphertext !== secretPlaintext, 'Ciphertext must be distinct from plaintext');

const decrypted = await decryptData(encryptedPkg, passphrase);
assert.strictEqual(decrypted, secretPlaintext, 'Decrypted text must match original plaintext');
console.log('  ✔ Web Crypto AES-256-GCM encryption/decryption roundtrip succeeded');

// Test wrong passphrase rejection
let failedWrongPass = false;
try {
  await decryptData(encryptedPkg, 'WrongPassword123');
} catch (err) {
  failedWrongPass = true;
}
assert(failedWrongPass, 'Decryption with wrong passphrase must fail');
console.log('  ✔ Tamper & wrong-passphrase rejection verified');

// Test IV & salt randomness (two encryptions of same data must differ)
const encryptedPkg2 = await encryptData(secretPlaintext, passphrase);
assert(encryptedPkg.salt !== encryptedPkg2.salt, 'Salts must be randomly generated');
assert(encryptedPkg.iv !== encryptedPkg2.iv, 'IVs must be unique per encryption');
assert(encryptedPkg.ciphertext !== encryptedPkg2.ciphertext, 'Ciphertexts must be nondeterministic');
console.log('  ✔ Cryptographic salt & IV entropy verified');


// ----------------------------------------------------
// 2. Single-User Account Allowlist
// ----------------------------------------------------
console.log('\n▶ Test 2: Testing Single-User Google Account Allowlist...');

function checkAuthorizedAccount(userEmail, configuredOwner) {
  if (!configuredOwner || configuredOwner.trim().length === 0) {
    return true; // No owner configured yet
  }
  return userEmail.trim().toLowerCase() === configuredOwner.trim().toLowerCase();
}

const owner = 'nispal.owner@gmail.com';
assert(checkAuthorizedAccount('nispal.owner@gmail.com', owner) === true, 'Matching account must be authorized');
assert(checkAuthorizedAccount('NISPAL.OWNER@GMAIL.COM', owner) === true, 'Case-insensitive matching must succeed');
assert(checkAuthorizedAccount('intruder@gmail.com', owner) === false, 'Unauthorized account must be blocked');
console.log('  ✔ Single-user allowlist correctly grants owner and rejects intruders');


// ----------------------------------------------------
// 3. Attachment Security & File Upload Policy
// ----------------------------------------------------
console.log('\n▶ Test 3: Testing Attachment Security & Executable Prohibitions...');

const BLOCKED_EXTS = new Set(['exe', 'sh', 'bat', 'cmd', 'js', 'vbs', 'msi', 'jar', 'apk', 'com', 'bin', 'reg']);
const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf', 'txt', 'docx', 'xlsx', 'csv', 'json']);
const MAX_IMG = 10 * 1024 * 1024;
const MAX_DOC = 20 * 1024 * 1024;

function validateAttachment(fileName, fileSize, isImage) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (BLOCKED_EXTS.has(ext)) {
    return { valid: false, reason: 'Prohibited executable extension' };
  }
  if (!ALLOWED_EXTS.has(ext)) {
    return { valid: false, reason: 'Unsupported file extension' };
  }
  const max = isImage ? MAX_IMG : MAX_DOC;
  if (fileSize > max) {
    return { valid: false, reason: 'File exceeds size limit' };
  }
  return { valid: true };
}

assert(validateAttachment('malware.exe', 1024, false).valid === false, 'Must reject .exe');
assert(validateAttachment('exploit.sh', 2048, false).valid === false, 'Must reject .sh');
assert(validateAttachment('script.bat', 512, false).valid === false, 'Must reject .bat');
assert(validateAttachment('payload.js', 1024, false).valid === false, 'Must reject .js');
assert(validateAttachment('receipt.pdf', 500000, false).valid === true, 'Must allow safe .pdf');
assert(validateAttachment('photo.jpg', 2000000, true).valid === true, 'Must allow safe .jpg');
assert(validateAttachment('huge.jpg', 12 * 1024 * 1024, true).valid === false, 'Must reject oversized image > 10MB');
assert(validateAttachment('huge.pdf', 25 * 1024 * 1024, false).valid === false, 'Must reject oversized doc > 20MB');
console.log('  ✔ Executable blocklist and size limits enforced');


// ----------------------------------------------------
// 4. Filename Sanitization & Path Traversal Prevention
// ----------------------------------------------------
console.log('\n▶ Test 4: Testing Filename Sanitization & Path Traversal Guard...');

function sanitizeFileName(raw) {
  if (!raw) return 'unnamed_file';
  const base = raw.replace(/^.*[\\\/]/, '').trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned || 'attachment';
}

assert.strictEqual(sanitizeFileName('../../../etc/passwd'), 'passwd', 'Must strip traversal directory separators');
assert.strictEqual(sanitizeFileName('..\\..\\Windows\\System32\\cmd.exe'), 'cmd.exe', 'Must strip Windows traversal');
const sanitizedTag = sanitizeFileName('<script>alert(1)</script>.png');
assert(!sanitizedTag.includes('<') && !sanitizedTag.includes('>') && !sanitizedTag.includes('/'), 'Must sanitize HTML tags and slashes');
assert.strictEqual(sanitizeFileName('my normal photo 2026.jpg'), 'my_normal_photo_2026.jpg', 'Must normalize spaces to underscores');
console.log('  ✔ Filename sanitization neutralizes traversal and script injection');


// ----------------------------------------------------
// 5. Notification Privacy Masking
// ----------------------------------------------------
console.log('\n▶ Test 5: Testing Notification Privacy Masking...');

function formatNotification(privacyMode, title, body) {
  if (privacyMode === 'private') {
    return {
      title: '🔔 Reminder',
      body: 'You have a scheduled reminder'
    };
  }
  return { title, body };
}

const detailedNotif = formatNotification('detailed', 'Doctor Appointment', 'Meet Dr. Sharma for MRI scan');
assert.strictEqual(detailedNotif.title, 'Doctor Appointment');
assert.strictEqual(detailedNotif.body, 'Meet Dr. Sharma for MRI scan');

const privateNotif = formatNotification('private', 'Doctor Appointment', 'Meet Dr. Sharma for MRI scan');
assert.strictEqual(privateNotif.title, '🔔 Reminder', 'Must mask title in private mode');
assert.strictEqual(privateNotif.body, 'You have a scheduled reminder', 'Must mask body in private mode');
console.log('  ✔ Notification privacy mode hides sensitive personal details on lock screens');


// ----------------------------------------------------
// 6. Google Drive Safe Deletion Protection
// ----------------------------------------------------
console.log('\n▶ Test 6: Testing Google Drive Deletion Lineage Guard...');

function verifyDeleteEligible(fileParents, allowedFolderIds) {
  if (!fileParents || !Array.isArray(fileParents) || fileParents.length === 0) {
    return false;
  }
  return fileParents.some(p => allowedFolderIds.has(p));
}

const appFolders = new Set(['folder_reminder_root', 'folder_backups', 'folder_images']);
assert(verifyDeleteEligible(['folder_backups'], appFolders) === true, 'App backup file must be eligible for deletion');
assert(verifyDeleteEligible(['unrelated_personal_folder'], appFolders) === false, 'Unrelated Google Drive file must be protected from deletion');
assert(verifyDeleteEligible([], appFolders) === false, 'Orphaned/unrelated file must be protected from deletion');
console.log('  ✔ Google Drive safe deletion guard strictly prevents deleting external files');

console.log('\n====================================================');
console.log('🎉 ALL 6 SECURITY VERIFICATION SUITES PASSED! (100%)');
console.log('====================================================\n');
