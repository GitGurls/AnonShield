'use strict';

const assert = require('assert');
const crypto = require('crypto');
const anonshield = require('../lib');

const AES_KEY_BYTES = 32;
const RSA_MODULUS_LENGTH = 3072;

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function publicKeyFingerprint(publicKeyPem) {
  return toBase64Url(
    crypto.createHash('sha256').update(publicKeyPem, 'utf8').digest().subarray(0, 16),
  );
}

class TestPhone {
  #rsaPrivateKey;
  #rsaPublicKeyPem;
  #signingPrivateKey;
  #signingPublicKeyPem;

  constructor() {
    const rsaKeys = crypto.generateKeyPairSync('rsa', {
      modulusLength: RSA_MODULUS_LENGTH,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const signingKeys = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.#rsaPrivateKey = rsaKeys.privateKey;
    this.#rsaPublicKeyPem = rsaKeys.publicKey;
    this.#signingPrivateKey = signingKeys.privateKey;
    this.#signingPublicKeyPem = signingKeys.publicKey;
    this.deviceKeyId = publicKeyFingerprint(this.#signingPublicKeyPem);
  }

  enrollmentBundle() {
    return {
      deviceKeyId: this.deviceKeyId,
      encryptionPublicKeyPem: this.#rsaPublicKeyPem,
      signingPublicKeyPem: this.#signingPublicKeyPem,
    };
  }

  answerChallenge(challenge) {
    const sessionKey = crypto.privateDecrypt(
      {
        key: this.#rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from(challenge.encryptedSessionKey, 'base64'),
    );

    assert.strictEqual(sessionKey.length, AES_KEY_BYTES);

    const responsePayload = Buffer.from(JSON.stringify({
      requestId: challenge.requestId,
      challenge: challenge.challenge,
      deviceKeyId: challenge.publicKeyId,
      sessionKey: sessionKey.toString('base64'),
    }));

    const signature = crypto.sign(null, responsePayload, this.#signingPrivateKey);

    return {
      deviceKeyId: challenge.publicKeyId,
      responsePayload: responsePayload.toString('base64'),
      signature: signature.toString('base64'),
    };
  }
}

const phone = new TestPhone();
const enrollment = phone.enrollmentBundle();
const pii = 'alice.private@example.com';

const encryptedRecord = anonshield.protect(pii, enrollment);
assert.deepStrictEqual(Object.keys(encryptedRecord).sort(), [
  'authTag',
  'ciphertext',
  'encryptedSessionKey',
  'iv',
  'publicKeyId',
]);
assert(!JSON.stringify(encryptedRecord).includes(pii));

const challenge = anonshield.createAccessChallenge(encryptedRecord);
const response = phone.answerChallenge(challenge);
const decrypted = anonshield.access(encryptedRecord, response, {
  expectedRequestId: challenge.requestId,
  expectedChallenge: challenge.challenge,
  signingPublicKeyPem: enrollment.signingPublicKeyPem,
});

assert.strictEqual(decrypted, pii);
console.log('AnonShield smoke test passed.');
