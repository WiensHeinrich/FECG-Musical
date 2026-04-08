import { redirect } from "next/navigation"
import { getActiveEvent } from "@/lib/queries/events"
import { getPerformancesWithAvailability } from "@/lib/queries/performances"
import { BookingForm } from "@/components/booking/booking-form"
import { getReservedSeatsForPerformance } from "@/lib/actions/booking"

export const metadata = {
  title: "Anmeldung",
}

export default async function AnmeldungPage() {
  const event = await getActiveEvent()
  if (!event) redirect("/")

  const now = new Date()
  const regStart = event.registration_start ? new Date(event.registration_start) : null
  const regEnd = event.registration_end ? new Date(event.registration_end) : null
  const isOpen = (!regStart || now >= regStart) && (!regEnd || now <= regEnd)

  if (!isOpen) redirect("/")

  const performances = await getPerformancesWithAvailability(event.id)

  // Reservierte Sitze pro Performance vorladen
  const reservedSeatsByPerformance: Record<string, string[]> = {}
  for (const perf of performances) {
    reservedSeatsByPerformance[perf.id] = await getReservedSeatsForPerformance(
      perf.id
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold">Sitzplatz reservieren</h1>
        <p className="mb-8 text-muted-foreground">
          Wähle einen Termin, deine Sitzplätze und bezahle bequem mit PayPal.
          Preis: {event.price_per_seat},00 EUR pro Platz (als Gutschein).
        </p>

        <BookingForm
          event={event}
          performances={performances}
          reservedSeatsByPerformance={reservedSeatsByPerformance}
        />
      </div>
    </div>
  )
}
