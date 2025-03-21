import CryptoJS from 'crypto-js';

const encryptionKey = 'my-secret-key-123'; 

export function encryptEntryData(entryTitle, entryText) {
  const encryptedTitle = CryptoJS.AES.encrypt(entryTitle, encryptionKey).toString();
  const encryptedText = CryptoJS.AES.encrypt(entryText, encryptionKey).toString();
  return { encryptedTitle, encryptedText };
}

export function decryptEntryData(encryptedTitle, encryptedText) {
  const decryptedTitle = CryptoJS.AES.decrypt(encryptedTitle, encryptionKey).toString(CryptoJS.enc.Utf8);
  const decryptedText = CryptoJS.AES.decrypt(encryptedText, encryptionKey).toString(CryptoJS.enc.Utf8);
  return { decryptedTitle, decryptedText };
}
