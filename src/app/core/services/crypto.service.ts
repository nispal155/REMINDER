import { Injectable } from '@angular/core';

export interface EncryptedPackage {
  format: 'REMINDER_ENC_V1';
  algorithm: 'AES-256-GCM';
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string; // Base64
  iv: string;   // Base64
  ciphertext: string; // Base64
  exportedAt: string;
  appVersion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly ITERATIONS = 100000;
  private readonly KEY_LENGTH = 256;

  /**
   * Derive a 256-bit AES-GCM key from a passphrase and salt using PBKDF2
   */
  private async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt arbitrary string data with user-supplied passphrase
   */
  async encrypt(data: string, passphrase: string, appVersion = '1.0.0'): Promise<EncryptedPackage> {
    if (!passphrase || passphrase.trim().length === 0) {
      throw new Error('A non-empty encryption passphrase is required.');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM
    const key = await this.deriveKey(passphrase, salt);

    const enc = new TextEncoder();
    const encodedData = enc.encode(data);

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      key,
      encodedData
    );

    return {
      format: 'REMINDER_ENC_V1',
      algorithm: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256',
      iterations: this.ITERATIONS,
      salt: this.bufferToBase64(salt),
      iv: this.bufferToBase64(iv),
      ciphertext: this.bufferToBase64(new Uint8Array(ciphertextBuffer)),
      exportedAt: new Date().toISOString(),
      appVersion
    };
  }

  /**
   * Decrypt an encrypted package using the user-supplied passphrase
   */
  async decrypt(pkg: EncryptedPackage, passphrase: string): Promise<string> {
    if (!pkg || pkg.format !== 'REMINDER_ENC_V1') {
      throw new Error('Unsupported or corrupted encrypted backup package format.');
    }
    if (!passphrase) {
      throw new Error('Passphrase is required to decrypt this backup.');
    }

    const salt = this.base64ToBuffer(pkg.salt);
    const iv = this.base64ToBuffer(pkg.iv);
    const ciphertext = this.base64ToBuffer(pkg.ciphertext);

    const key = await this.deriveKey(passphrase, salt);

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource
        },
        key,
        ciphertext as unknown as BufferSource
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } catch {
      throw new Error('Decryption failed: Incorrect passphrase or tampered backup payload.');
    }
  }

  /**
   * Utility to test if an unknown string is an encrypted package
   */
  isEncryptedPackage(content: string): boolean {
    try {
      const parsed = JSON.parse(content);
      return parsed?.format === 'REMINDER_ENC_V1' && !!parsed?.ciphertext && !!parsed?.salt;
    } catch {
      return false;
    }
  }

  private bufferToBase64(buf: Uint8Array): string {
    let binary = '';
    const len = buf.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buf[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
