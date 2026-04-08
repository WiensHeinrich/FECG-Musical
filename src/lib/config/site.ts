export const siteConfig = {
  name: "Weihnachtsmusical",
  church: "FECG Trossingen e.V.",
  description: "Buchungssystem für das Weihnachtsmusical der FECG Gemeinde",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  navigation: [
    { title: "Startseite", href: "/" },
    { title: "Informationen", href: "/informationen" },
    { title: "Anmeldung", href: "/anmeldung" },
  ] as const,
}
