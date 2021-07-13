const crypto = require("crypto");
require("dotenv").config();
const iv = crypto.randomBytes(16);

function encrypt(data) {
  const key_in_bytes = Buffer.from(process.env.REACT_APP_MASTER_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-ctr", key_in_bytes, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

function decrypt(data) {
  const key_in_bytes = Buffer.from(process.env.REACT_APP_MASTER_KEY, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    key_in_bytes,
    Buffer.from(data.iv, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
}
module.exports = {
  encrypt,
  decrypt,
};
