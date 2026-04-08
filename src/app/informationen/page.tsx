import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveEvent } from "@/lib/queries/events"
import { Info, MapPin, Mail, Phone, CreditCard } from "lucide-react"

export const metadata = {
  title: "Informationen",
}

export default async function InformationenPage() {
  const event = await getActiveEvent()

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold">Informationen</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Über das Musical
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-muted-foreground">
            <p>
              {event?.description ||
                "Erleben Sie unser Weihnachtsmusical - eine besondere Aufführung für die ganze Familie."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Veranstaltungsort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {event?.location || "Dr.-Ernst-Hohner-Konzerthaus, Trossingen"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Ticketpreise & Gutscheine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              <strong>{event?.price_per_seat || 3},00 EUR</strong> pro Sitzplatz
            </p>
            <p>
              Der Ticketpreis wird komplett als Gutschein ausgegeben. Mit den
              Gutscheinen kannst du am Tag der Aufführung z.B. Kuchen und
              Getränke kaufen.
            </p>
            <p>Die Bezahlung erfolgt bequem über PayPal.</p>
          </CardContent>
        </Card>

        {(event?.contact_email || event?.contact_phone) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Kontakt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {event.contact_email && (
                <p>
                  <a
                    href={`mailto:${event.contact_email}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {event.contact_email}
                  </a>
                </p>
              )}
              {event.contact_phone && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {event.contact_phone}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
