// PIN hashing for the app lock (PBKDF2-SHA256). This protects the lock screen only; it does not encrypt app data.
const te = new TextEncoder();
export const ITER = 600000;
export const hasCrypto = () => typeof crypto !== "undefined" && !!crypto.subtle;
const b64 = (buf) => { const a = new Uint8Array(buf); let s = ""; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
export const randSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)));
export async function hashPin(pin, salt64, iter = ITER) {
  const base = await crypto.subtle.importKey("raw", te.encode(pin), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: unb64(salt64), iterations: iter, hash: "SHA-256" }, base, 256));
}
export const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
