// Prefix for files in /public when the site is served from a sub-path (GitHub Pages project site).
export const withBase = (p) => (process.env.NEXT_PUBLIC_BASE_PATH || "") + p;
