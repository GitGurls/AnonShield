# anonshield-node

AnonShield is a prototype Node.js middleware package for protecting server-side PII. It encrypts application data before storage and keeps the absolute unwrap authority on a user's phone, not on the application server.

This package has zero runtime dependencies and uses Node's native `crypto` module.

## Security Model

- PII payloads are encrypted with `AES-256-GCM`.
- Each protected value gets a fresh random AES session key and IV.
- The AES session key is wrapped with the user's phone enrollment RSA public key using `RSA-OAEP-SHA256`.
- Phone access responses are verified with an enrolled Ed25519 signing public key.
- Database records produced by `protect()` contain only:
  - `ciphertext`
  - `iv`
  - `authTag`
  - `encryptedSessionKey`
  - `publicKeyId`

The server must store enrollment public keys separately from protected records. It must never store phone private keys, raw session keys, cookies, server sessions, or cloud KMS material for this flow.

## Install

```bash
npm install anonshield-node
```

For local development from this repository:

```bash
npm link
```

## API

```js
const anonshield = require('anonshield-node');
```

### `protect(piiData, userPublicKeyBundle)`

Encrypts a raw PII string and returns a database-safe record.

```js
const protectedRecord = anonshield.protect('alice.private@example.com', {
  deviceKeyId: 'phone_public_key_identifier',
  encryptionPublicKeyPem: enrollment.encryptionPublicKeyPem
});

await db.collection('users').insertOne(protectedRecord);
```

### `createAccessChallenge(encryptedDbRecord)`

Creates a stateless challenge to send to the user's phone over your push or device channel.

```js
const accessChallenge = anonshield.createAccessChallenge(encryptedRecord);

// Send to phone:
// {
//   requestId,
//   challenge,
//   publicKeyId,
//   encryptedSessionKey
// }
```

### `access(encryptedDbRecord, phoneHandshakeResponse, handshakeContext)`

Verifies the phone's signed response, unwraps the AES session key returned by the phone, and decrypts the protected value in transient server memory.

```js
const plaintext = anonshield.access(encryptedRecord, phoneHandshakeResponse, {
  expectedRequestId: accessChallenge.requestId,
  expectedChallenge: accessChallenge.challenge,
  signingPublicKeyPem: enrollment.signingPublicKeyPem
});
```

## Express-Style Integration

```js
const anonshield = require('anonshield-node');

async function handleUserRegistration(req, res) {
  const { rawEmail, userEnrollmentBundle } = req.body;

  const protectedRecord = anonshield.protect(rawEmail, userEnrollmentBundle);
  await db.collection('users').insertOne(protectedRecord);

  res.status(201).json({ success: true });
}

async function beginEmailRead(req, res) {
  const encryptedRecord = await db.collection('users').findOne({ publicKeyId: req.params.publicKeyId });
  const challenge = anonshield.createAccessChallenge(encryptedRecord);

  await pushService.send(req.params.deviceId, {
    requestId: challenge.requestId,
    challenge: challenge.challenge,
    publicKeyId: challenge.publicKeyId,
    encryptedSessionKey: challenge.encryptedSessionKey
  });

  res.json({
    requestId: challenge.requestId,
    challenge: challenge.challenge
  });
}

async function completeEmailRead(req, res) {
  const { publicKeyId, phoneHandshakeResponse, requestId, challenge } = req.body;

  const encryptedRecord = await db.collection('users').findOne({ publicKeyId });
  const enrollment = await db.collection('enrollments').findOne({ deviceKeyId: publicKeyId });

  const email = anonshield.access(encryptedRecord, phoneHandshakeResponse, {
    expectedRequestId: requestId,
    expectedChallenge: challenge,
    signingPublicKeyPem: enrollment.signingPublicKeyPem
  });

  res.json({ email });
}
```

## Prototype

The repository also includes a single-file runnable proof of concept with a phone simulator:

```bash
npm run prototype
```

Run the package smoke test:

```bash
npm test
```

## Production Notes

This is a prototype. A production mobile client should keep private keys in the platform secure enclave or hardware-backed keystore, bind push requests to authenticated device enrollment, rate limit approvals, and avoid logging plaintext PII.
