import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getReservationDetail } from "@/lib/queries/admin"
import { formatDateTime, formatShortDate } from "@/lib/utils"
import { ReservationActions } from "@/components/admin/reservation-actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Reservierung Details",
}

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reservation = await getReservationDetail(id)

  if (!reservation) notFound()

  const r = reservation as Record<string, unknown>
  const performance = r.performance as Record<string, unknown> | null
  const seats = (r.reserved_seats as Record<string, unknown>[]) || []

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/reservierungen">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Reservierung</h1>
        <Badge
          variant={
            r.status === "bestätigt" ? "default" :
            r.status === "reserviert" ? "outline" :
            r.status === "storniert" ? "destructive" :
            "secondary"
          }
        >
          {String(r.status)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kontaktdaten */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kontaktdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{r.contact_first_name as string} {r.contact_last_name as string}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">E-Mail:</span>
              <a href={`mailto:${r.contact_email}`} className="font-medium text-primary">{r.contact_email as string}</a>
            </div>
            {r.contact_phone ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefon:</span>
                <span className="font-medium">{String(r.contact_phone)}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Zahlung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zahlung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Betrag:</span>
              <span className="text-lg font-bold">{r.total_amount as number},00 EUR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Methode:</span>
              <span className="font-medium">{(r.payment_method as string) === "paypal" ? "PayPal" : "Überweisung"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zahlungsstatus:</span>
              <Badge variant={(r.payment_status as string) === "bezahlt" ? "default" : "outline"}>
                {String(r.payment_status)}
              </Badge>
            </div>
            {r.payment_reference ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verwendungszweck:</span>
                <span className="font-mono font-medium">{String(r.payment_reference)}</span>
              </div>
            ) : null}
            {r.expires_at ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gültig bis:</span>
                <span className="font-medium">{formatDateTime(String(r.expires_at))}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Erstellt:</span>
              <span>{formatDateTime(r.created_at as string)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Aufführung */}
        {performance && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aufführung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Termin:</span>
                <span className="font-medium">{performance.title as string}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Datum:</span>
                <span>{formatShortDate(performance.date as string)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uhrzeit:</span>
                <span>{performance.time as string} Uhr</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sitzplätze */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Sitzplätze ({seats.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seats.map((seat) => (
                <div
                  key={seat.id as string}
                  className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{seat.guest_name as string}</span>
                  <span className="text-muted-foreground">{seat.seat_id as string}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin-Aktionen */}
      <div className="mt-6">
        <ReservationActions
          reservationId={r.id as string}
          status={String(r.status)}
          paymentStatus={String(r.payment_status)}
          adminNotes={(r.admin_notes as string) || ""}
        />
      </div>
    </div>
  )
}
