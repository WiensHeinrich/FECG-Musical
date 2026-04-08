import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveEvent } from "@/lib/queries/events"

export const metadata = {
  title: "Einstellungen",
}

export default async function EinstellungenPage() {
  const event = await getActiveEvent()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Aktive Veranstaltung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {event ? (
            <>
              <p>
                <strong>Titel:</strong> {event.title}
              </p>
              <p>
                <strong>Ort:</strong> {event.location || "-"}
              </p>
              <p>
                <strong>Preis pro Platz:</strong> {event.price_per_seat},00 EUR
              </p>
              <p>
                <strong>PayPal Client ID:</strong>{" "}
                {event.paypal_client_id ? "Konfiguriert" : "Nicht konfiguriert"}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Einstellungen werden direkt in der Datenbank (Supabase) verwaltet.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">
              Keine aktive Veranstaltung gefunden.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
