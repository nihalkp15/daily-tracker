// Rejects PINs that are trivial to guess: repeats (0000), sequences (1234, 4321) and repeated pairs (1212).
export const isWeak = (p) => /^(\d)\1+$/.test(p) || "01234567890".includes(p) || "09876543210".includes(p) || /^(\d\d)\1+$/.test(p);
