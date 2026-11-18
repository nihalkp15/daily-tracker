import { Outfit } from "next/font/google";
import "../styles/themes.css";
import "../styles/base.css";
import "../styles/components.css";
import "../styles/modules.css";
import "../styles/responsive.css"; // keep last: media queries override the rest

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const font = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });
export const metadata = {
  title: "Daily Tracker",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
  manifest: base + "/manifest.webmanifest",
  icons: { icon: base + "/icon-192.png", apple: base + "/icon-192.png" },
  appleWebApp: { capable: true, title: "Tracker", statusBarStyle: "black-translucent" },
};
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#16120f" };

// GitHub Pages cannot set response headers, so the CSP is delivered as a meta tag (production build only).
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>{process.env.NODE_ENV === "production" && <meta httpEquiv="Content-Security-Policy" content={csp} />}</head>
      <body className={font.className}>{children}</body>
    </html>
  );
}
