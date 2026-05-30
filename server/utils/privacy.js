const crypto = require('crypto');

exports.hashIP = (ip) => {
  return crypto
    .createHash('sha256')
    .update(ip + (process.env.IP_SALT || 'anon_default_salt'))
    .digest('hex')
    .substring(0, 16);
};
