'use strict';

const crypto = require('crypto');

const AES_KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;
const CHALLENGE_BYTES = 32;

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function requireNonEmptyString(value, name) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

function requireObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be an object`);
  }
}

function requireBase64(value, name) {
  requireNonEmptyString(value, name);

  const decoded = Buffer.from(value, 'base64');
  const normalizedInput = value.replace(/=+$/g, '');
  const normalizedOutput = decoded.toString('base64').replace(/=+$/g, '');

  if (decoded.length === 0 || normalizedInput !== normalizedOutput) {
    throw new TypeError(`${name} must be valid base64`);
  }

  return decoded;
}

function publicKeyFingerprint(publicKeyPem) {
  requireNonEmptyString(publicKeyPem, 'publicKeyPem');

  return toBase64Url(
    crypto.createHash('sha256').update(publicKeyPem, 'utf8').digest().subarray(0, 16),
  );
}

class AnonShield {
  protect(piiData, userPublicKeyBundle) {
    requireNonEmptyString(piiData, 'piiData');
    this.#validatePublicBundle(userPublicKeyBundle);

    const sessionKey = crypto.randomBytes(AES_KEY_BYTES);
    const iv = crypto.randomBytes(GCM_IV_BYTES);

    try {
      const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey, iv, {
        authTagLength: GCM_TAG_BYTES,
      });
      const ciphertext = Buffer.concat([
        cipher.update(piiData, 'utf8'),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();

      const encryptedSessionKey = crypto.publicEncrypt(
        {
          key: userPublicKeyBundle.encryptionPublicKeyPem,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        sessionKey,
      );

      return Object.freeze({
        ciphertext: ciphertext.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        encryptedSessionKey: encryptedSessionKey.toString('base64'),
        publicKeyId: userPublicKeyBundle.deviceKeyId,
      });
    } finally {
      sessionKey.fill(0);
    }
  }

  createAccessChallenge(encryptedDbRecord) {
    this.#validateDbRecord(encryptedDbRecord);

    const requestId = crypto.randomUUID();
    const challenge = toBase64Url(crypto.randomBytes(CHALLENGE_BYTES));

    return Object.freeze({
      requestId,
      challenge,
      publicKeyId: encryptedDbRecord.publicKeyId,
      encryptedSessionKey: encryptedDbRecord.encryptedSessionKey,
    });
  }

  access(encryptedDbRecord, phoneHandshakeResponse, handshakeContext) {
    this.#validateDbRecord(encryptedDbRecord);
    requireObject(handshakeContext, 'handshakeContext');
    requireNonEmptyString(handshakeContext.expectedRequestId, 'handshakeContext.expectedRequestId');
    requireNonEmptyString(handshakeContext.expectedChallenge, 'handshakeContext.expectedChallenge');
    requireNonEmptyString(handshakeContext.signingPublicKeyPem, 'handshakeContext.signingPublicKeyPem');

    const sessionKey = this.#verifyPhoneResponse({
      phoneResponse: phoneHandshakeResponse,
      expectedRequestId: handshakeContext.expectedRequestId,
      expectedChallenge: handshakeContext.expectedChallenge,
      expectedDeviceKeyId: encryptedDbRecord.publicKeyId,
      signingPublicKeyPem: handshakeContext.signingPublicKeyPem,
    });

    try {
      return this.#decryptPayload(encryptedDbRecord, sessionKey);
    } finally {
      sessionKey.fill(0);
    }
  }

  #validatePublicBundle(bundle) {
    requireObject(bundle, 'userPublicKeyBundle');
    requireNonEmptyString(bundle.deviceKeyId, 'userPublicKeyBundle.deviceKeyId');
    requireNonEmptyString(bundle.encryptionPublicKeyPem, 'userPublicKeyBundle.encryptionPublicKeyPem');
    crypto.createPublicKey(bundle.encryptionPublicKeyPem);
  }

  #validateDbRecord(record) {
    requireObject(record, 'encryptedDbRecord');

    for (const field of ['publicKeyId', 'ciphertext', 'iv', 'authTag', 'encryptedSessionKey']) {
      requireNonEmptyString(record[field], `encryptedDbRecord.${field}`);
    }

    const iv = requireBase64(record.iv, 'encryptedDbRecord.iv');
    const authTag = requireBase64(record.authTag, 'encryptedDbRecord.authTag');
    requireBase64(record.ciphertext, 'encryptedDbRecord.ciphertext');
    requireBase64(record.encryptedSessionKey, 'encryptedDbRecord.encryptedSessionKey');

    if (iv.length !== GCM_IV_BYTES) {
      throw new Error(`encryptedDbRecord.iv must decode to ${GCM_IV_BYTES} bytes`);
    }
    if (authTag.length !== GCM_TAG_BYTES) {
      throw new Error(`encryptedDbRecord.authTag must decode to ${GCM_TAG_BYTES} bytes`);
    }
  }

  #verifyPhoneResponse({
    phoneResponse,
    expectedRequestId,
    expectedChallenge,
    expectedDeviceKeyId,
    signingPublicKeyPem,
  }) {
    requireObject(phoneResponse, 'phoneHandshakeResponse');
    requireNonEmptyString(phoneResponse.deviceKeyId, 'phoneHandshakeResponse.deviceKeyId');
    requireNonEmptyString(phoneResponse.responsePayload, 'phoneHandshakeResponse.responsePayload');
    requireNonEmptyString(phoneResponse.signature, 'phoneHandshakeResponse.signature');
    crypto.createPublicKey(signingPublicKeyPem);

    if (phoneResponse.deviceKeyId !== expectedDeviceKeyId) {
      throw new Error('Phone response deviceKeyId mismatch');
    }

    const responsePayload = requireBase64(
      phoneResponse.responsePayload,
      'phoneHandshakeResponse.responsePayload',
    );
    const signature = requireBase64(phoneResponse.signature, 'phoneHandshakeResponse.signature');

    const verified = crypto.verify(null, responsePayload, signingPublicKeyPem, signature);
    if (!verified) {
      throw new Error('Phone response signature verification failed');
    }

    let parsed;
    try {
      parsed = JSON.parse(responsePayload.toString('utf8'));
    } catch (error) {
      throw new Error(`Phone response payload is not valid JSON (${error.message})`);
    }

    if (
      parsed.requestId !== expectedRequestId ||
      parsed.challenge !== expectedChallenge ||
      parsed.deviceKeyId !== expectedDeviceKeyId
    ) {
      throw new Error('Phone response challenge binding failed');
    }

    const sessionKey = requireBase64(parsed.sessionKey, 'phoneHandshakeResponse.sessionKey');
    if (sessionKey.length !== AES_KEY_BYTES) {
      throw new Error(`Phone response sessionKey must decode to ${AES_KEY_BYTES} bytes`);
    }

    return sessionKey;
  }

  #decryptPayload(record, sessionKey) {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        sessionKey,
        Buffer.from(record.iv, 'base64'),
        { authTagLength: GCM_TAG_BYTES },
      );
      decipher.setAuthTag(Buffer.from(record.authTag, 'base64'));

      return Buffer.concat([
        decipher.update(Buffer.from(record.ciphertext, 'base64')),
        decipher.final(),
      ]).toString('utf8');
    } catch (error) {
      throw new Error(`AES-GCM payload decrypt failed (${error.message})`);
    }
  }
}

const anonshield = new AnonShield();

module.exports = anonshield;
module.exports.AnonShield = AnonShield;
module.exports.publicKeyFingerprint = publicKeyFingerprint;
