"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { updateEventSettings } from "@/lib/actions/admin"
import { Save } from "lucide-react"

export default function EinstellungenPage() {
  const [event, setEvent] = useState<Record<string, unknown> | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .single()
      .then(({ data }) => setEvent(data))
  }, [])

  if (!event) return <p className="text-muted-foreground">Lade Einstellungen...</p>

  const handleSave = (data: Record<string, unknown>) => {
    startTransition(async () => {
      const result = await updateEventSettings(event.id as string, data)
      if (result.error) toast.error(result.error)
      else toast.success("Gespeichert!")
    })
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Einstellungen</h1>

      <div className="space-y-6">
        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Veranstaltung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input
                defaultValue={event.title as string}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                defaultValue={(event.description as string) || ""}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Ort</Label>
              <Input
                defaultValue={(event.location as string) || ""}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Preis pro Sitzplatz (EUR)</Label>
                <Input
                  type="number"
                  defaultValue={event.price_per_seat as number}
                  onChange={(e) => setEvent({ ...event, price_per_seat: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Gültigkeit Reservierung (Tage)</Label>
                <Input
                  type="number"
                  defaultValue={event.reservation_validity_days as number}
                  onChange={(e) => setEvent({ ...event, reservation_validity_days: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Anmeldung ab</Label>
                <Input
                  type="datetime-local"
                  defaultValue={(event.registration_start as string)?.slice(0, 16) || ""}
                  onChange={(e) => setEvent({ ...event, registration_start: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Anmeldung bis</Label>
                <Input
                  type="datetime-local"
                  defaultValue={(event.registration_end as string)?.slice(0, 16) || ""}
                  onChange={(e) => setEvent({ ...event, registration_end: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave({
                title: event.title,
                description: event.description,
                location: event.location,
                price_per_seat: event.price_per_seat,
                reservation_validity_days: event.reservation_validity_days,
                registration_start: event.registration_start,
                registration_end: event.registration_end,
              })}
              disabled={isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Kontakt */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>E-Mail</Label>
                <Input
                  defaultValue={(event.contact_email as string) || ""}
                  onChange={(e) => setEvent({ ...event, contact_email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input
                  defaultValue={(event.contact_phone as string) || ""}
                  onChange={(e) => setEvent({ ...event, contact_phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave({
                contact_email: event.contact_email,
                contact_phone: event.contact_phone,
              })}
              disabled={isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Bankdaten */}
        <Card>
          <CardHeader>
            <CardTitle>Bankdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Kontoinhaber</Label>
                <Input
                  defaultValue={(event.account_holder as string) || ""}
                  onChange={(e) => setEvent({ ...event, account_holder: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>IBAN</Label>
                <Input
                  defaultValue={(event.iban as string) || ""}
                  onChange={(e) => setEvent({ ...event, iban: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>BIC</Label>
                <Input
                  defaultValue={(event.bic as string) || ""}
                  onChange={(e) => setEvent({ ...event, bic: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Verwendungszweck-Präfix</Label>
                <Input
                  defaultValue={(event.bank_reference_prefix as string) || "WM"}
                  onChange={(e) => setEvent({ ...event, bank_reference_prefix: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={() => handleSave({
                account_holder: event.account_holder,
                iban: event.iban,
                bic: event.bic,
                bank_reference_prefix: event.bank_reference_prefix,
              })}
              disabled={isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* PayPal */}
        <Card>
          <CardHeader>
            <CardTitle>PayPal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>PayPal Client ID</Label>
              <Input
                defaultValue={(event.paypal_client_id as string) || ""}
                onChange={(e) => setEvent({ ...event, paypal_client_id: e.target.value })}
                placeholder="Leer lassen wenn PayPal nicht aktiv"
                className="mt-1"
              />
            </div>
            <Button
              onClick={() => handleSave({ paypal_client_id: event.paypal_client_id || null })}
              disabled={isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
