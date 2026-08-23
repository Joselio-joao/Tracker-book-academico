const BACKUP_PREFIX = "SUPER_TRACKER_BACKUP_V1";
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_ITERATIONS = 210_000;

function toBase64(value: Uint8Array): string {
  let binary = "";
  value.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!password) throw new Error("Define uma palavra-passe para proteger a cópia.");
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: KEY_ITERATIONS, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptBackup(plainText: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plainText)));
  return [BACKUP_PREFIX, toBase64(salt), toBase64(iv), toBase64(encrypted)].join(".");
}

export async function decryptBackup(serialized: string, password: string): Promise<string> {
  const [prefix, saltValue, ivValue, encryptedValue] = serialized.trim().split(".");
  if (prefix !== BACKUP_PREFIX || !saltValue || !ivValue || !encryptedValue) throw new Error("Esta cópia não é um backup válido do Super Tracker.");
  try {
    const salt = fromBase64(saltValue);
    const iv = fromBase64(ivValue);
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, fromBase64(encryptedValue));
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error("Não foi possível abrir a cópia. Confirma a palavra-passe e escolhe um ficheiro intacto.");
  }
}

export const BACKUP_FORMAT = BACKUP_PREFIX;
