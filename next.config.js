// Static export: the build produces plain files in /out (no Node server in production).
// On GitHub Pages a project site lives at /<repo-name>/, so the base path is set automatically in the Actions build.
const repo = (process.env.GITHUB_REPOSITORY || "").split("/")[1] || "";
const onPages = process.env.GITHUB_ACTIONS === "true" && repo && !repo.endsWith(".github.io");
const basePath = onPages ? "/" + repo : "";
module.exports = {
  output: "export",
  ...(basePath ? { basePath } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: { unoptimized: true },
};
