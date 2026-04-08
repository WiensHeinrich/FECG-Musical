import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Turbopack hat Probleme mit UNC-Pfaden auf Netzlaufwerken.
  // Auf Vercel laeuft der Build normal.
  // Fuer lokale Entwicklung: `npm run dev` nutzen (funktioniert mit Turbopack).
}

export default nextConfig
