"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Event, PerformanceWithAvailability, PaymentMethod } from "@/lib/types/database"
import { SeatMap } from "@/components/seatmap/seat-map"
import { PerformanceSelect } from "./performance-select"
import { GuestNameList } from "./guest-name-list"
import { PayPalCheckout } from "./paypal-checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createReservation } from "@/lib/actions/booking"
import { Loader2, CreditCard, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

type BookingFormProps = {
  event: Event
  performances: PerformanceWithAvailability[]
  reservedSeatsByPerformance: Record<string, string[]>
}

type SeatEntry = { seatId: string; guestName: string }

export function BookingForm({
  event,
  performances,
  reservedSeatsByPerformance,
}: BookingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<SeatEntry[]>([])
  const [contactFirstName, setContactFirstName] = useState("")
  const [contactLastName, setContactLastName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isPaid, setIsPaid] = useState(false)
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reservedSeats = new Set(
    selectedPerformanceId
      ? (reservedSeatsByPerformance[selectedPerformanceId] || [])
      : []
  )

  const totalAmount = selectedSeats.length * event.price_per_seat

  const handleSeatToggle = useCallback((seatId: string) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatId === seatId)
      if (exists) return prev.filter((s) => s.seatId !== seatId)
      return [...prev, { seatId, guestName: "" }]
    })
  }, [])

  const handleNameChange = useCallback((seatId: string, name: string) => {
    setSelectedSeats((prev) =>
      prev.map((s) => (s.seatId === seatId ? { ...s, guestName: name } : s))
    )
  }, [])

  const handleRemoveSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seatId))
  }, [])

  const handlePaymentSuccess = useCallback((orderId: string) => {
    setIsPaid(true)
    setPaypalOrderId(orderId)
    toast.success("Zahlung erfolgreich!")
  }, [])

  const canProceedStep1 = selectedPerformanceId !== null
  const canProceedStep2 = selectedSeats.length > 0
  const canProceedStep3 =
    contactFirstName.length >= 2 &&
    contactLastName.length >= 2 &&
    contactEmail.includes("@") &&
    selectedSeats.every((s) => s.guestName.length >= 2)

  const canSubmit =
    canProceedStep3 &&
    paymentMethod !== null &&
    (paymentMethod === "ueberweisung" || isPaid)

  const handleSubmit = async () => {
    if (!selectedPerformanceId || !paymentMethod) return
    if (paymentMethod === "paypal" && !isPaid) return

    setIsSubmitting(true)
    try {
      const result = await createReservation({
        eventId: event.id,
        performanceId: selectedPerformanceId,
        contactFirstName,
        contactLastName,
        contactEmail,
        contactPhone: contactPhone || null,
        seats: selectedSeats,
        paymentMethod,
        paypalOrderId: paypalOrderId,
        totalAmount,
      })

      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      router.push(
        `/anmeldung/bestaetigung?id=${result.reservationId}&token=${result.token}&method=${paymentMethod}`
      )
    } catch {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
      setIsSubmitting(false)
    }
  }

  const hasPaypal = !!event.paypal_client_id
  const hasBank = !!(event.iban && event.account_holder)

  return (
    <div className="space-y-8">
      {/* Schritt 1: Termin wählen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              1
            </span>
            Termin wählen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceSelect
            performances={performances}
            selectedId={selectedPerformanceId}
            onSelect={(id) => {
              setSelectedPerformanceId(id)
              setSelectedSeats([])
              if (step < 2) setStep(2)
            }}
          />
        </CardContent>
      </Card>

      {/* Schritt 2: Sitzplätze wählen */}
      {step >= 2 && canProceedStep1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </span>
              Sitzplätze wählen
              {selectedSeats.length > 0 && (
                <span className="ml-auto text-base font-normal text-muted-foreground">
                  {selectedSeats.length} Platz/Plätze = {totalAmount},00 EUR
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SeatMap
              reservedSeats={reservedSeats}
              selectedSeats={selectedSeats.map((s) => s.seatId)}
              onSeatToggle={handleSeatToggle}
            />
            {selectedSeats.length > 0 && (
              <>
                <Separator className="my-6" />
                <h3 className="mb-4 text-sm font-semibold">Namen der Gäste eintragen:</h3>
                <GuestNameList
                  seats={selectedSeats}
                  onNameChange={handleNameChange}
                  onRemoveSeat={handleRemoveSeat}
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2 || !selectedSeats.every((s) => s.guestName.length >= 2)}
                  >
                    Weiter zu Kontaktdaten
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schritt 3: Kontaktdaten + Zahlung */}
      {step >= 3 && canProceedStep2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </span>
              Kontaktdaten & Zahlung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Kontaktdaten */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Vorname *</Label>
                <Input id="firstName" value={contactFirstName} onChange={(e) => setContactFirstName(e.target.value)} placeholder="Max" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname *</Label>
                <Input id="lastName" value={contactLastName} onChange={(e) => setContactLastName(e.target.value)} placeholder="Mustermann" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input id="email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="max@example.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Telefon (optional)</Label>
                <Input id="phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+49 ..." className="mt-1" />
              </div>
            </div>

            <Separator />

            {/* Zusammenfassung */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="mb-2 font-semibold">Zusammenfassung</h4>
              <p className="text-sm text-muted-foreground">{selectedSeats.length} Sitzplatz/Sitzplätze</p>
              <p className="mt-1 text-lg font-bold">Gesamt: {totalAmount},00 EUR</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Der Betrag wird als Gutschein ausgegeben (z.B. für Kuchen & Getränke).
              </p>
            </div>

            {/* Zahlungsmethode wählen */}
            {canProceedStep3 && (
              <div>
                <h4 className="mb-3 font-semibold">Zahlungsmethode wählen</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* PayPal */}
                  {hasPaypal && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("paypal"); setIsPaid(false); setPaypalOrderId(null) }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
                        paymentMethod === "paypal"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-xs text-muted-foreground">Sofortige Bestätigung</p>
                      </div>
                    </button>
                  )}

                  {/* Überweisung */}
                  {hasBank && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("ueberweisung"); setIsPaid(false); setPaypalOrderId(null) }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
                        paymentMethod === "ueberweisung"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Building2 className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Überweisung</p>
                        <p className="text-xs text-muted-foreground">Zahlung innerhalb von {event.reservation_validity_days} Tagen</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* PayPal Checkout */}
                {paymentMethod === "paypal" && !isPaid && event.paypal_client_id && (
                  <div className="mt-4">
                    <PayPalCheckout
                      clientId={event.paypal_client_id}
                      amount={totalAmount}
                      currency={event.paypal_currency}
                      onSuccess={handlePaymentSuccess}
                      onError={(err) => toast.error(`Zahlung fehlgeschlagen: ${err}`)}
                    />
                  </div>
                )}

                {/* PayPal bestätigt */}
                {paymentMethod === "paypal" && isPaid && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    Zahlung per PayPal erfolgreich!
                  </div>
                )}

                {/* Überweisung: Bankdaten anzeigen */}
                {paymentMethod === "ueberweisung" && (
                  <div className="mt-4 rounded-lg border bg-muted/30 p-4 space-y-2">
                    <p className="text-sm font-medium">Bitte überweise nach Abschluss der Reservierung:</p>
                    <div className="grid gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empfänger:</span>
                        <span className="font-medium">{event.account_holder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IBAN:</span>
                        <span className="font-mono font-medium">{event.iban}</span>
                      </div>
                      {event.bic && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BIC:</span>
                          <span className="font-mono font-medium">{event.bic}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Betrag:</span>
                        <span className="font-bold">{totalAmount},00 EUR</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Den Verwendungszweck erhältst du nach Abschluss der Reservierung per E-Mail.
                        Bitte überweise innerhalb von {event.reservation_validity_days} Tagen.
                      </p>
                    </div>
                  </div>
                )}

                {/* Kein Zahlungsmittel verfügbar */}
                {!hasPaypal && !hasBank && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aktuell ist keine Zahlungsmethode konfiguriert. Bitte kontaktiere den Veranstalter.
                  </p>
                )}
              </div>
            )}

            {!canProceedStep3 && (
              <p className="text-sm text-destructive">
                Bitte fülle alle Pflichtfelder aus und trage für jeden Sitzplatz einen Namen ein.
              </p>
            )}

            {/* Abschließen */}
            {canSubmit && (
              <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reservierung wird erstellt...
                  </>
                ) : paymentMethod === "ueberweisung" ? (
                  "Reservierung abschließen (Zahlung per Überweisung)"
                ) : (
                  "Reservierung abschließen"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
