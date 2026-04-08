import Link from "next/link"
import { Calendar, MapPin, Music, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveEvent } from "@/lib/queries/events"
import { getPerformancesWithAvailability } from "@/lib/queries/performances"
import { formatDate, formatTime, formatWeekday } from "@/lib/utils"
import { getTotalSeats } from "@/lib/seatmap/layout"

export default async function HomePage() {
  const event = await getActiveEvent()

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Music className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-bold">Weihnachtsmusical</h1>
        <p className="mt-4 text-muted-foreground">
          Aktuell gibt es keine Veranstaltung. Schau später wieder vorbei!
        </p>
      </div>
    )
  }

  const performances = await getPerformancesWithAvailability(event.id)
  const totalCapacity = getTotalSeats()

  const now = new Date()
  const regStart = event.registration_start ? new Date(event.registration_start) : null
  const regEnd = event.registration_end ? new Date(event.registration_end) : null
  const isRegistrationOpen =
    (!regStart || now >= regStart) && (!regEnd || now <= regEnd)

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {event.title}
        </h1>
        {event.description && (
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        )}
        {event.location && (
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
      </section>

      {/* Aufführungstermine */}
      {performances.length > 0 && (
        <section className="mx-auto mt-12 max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Aufführungstermine
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {performances.map((perf) => {
              const available = perf.available_seats
              const percentage = Math.round(
                (perf.reserved_seats / totalCapacity) * 100
              )
              return (
                <Card key={perf.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {perf.title || formatWeekday(perf.date)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(perf.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span>Beginn: {formatTime(`2000-01-01T${perf.time}`)}</span>
                    </div>
                    {perf.doors_open && (
                      <p className="text-xs text-muted-foreground">
                        Einlass ab {formatTime(`2000-01-01T${perf.doors_open}`)}
                      </p>
                    )}
                    <div className="pt-2">
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{available} Plätze frei</span>
                        <span>{percentage}% belegt</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto mt-12 max-w-lg text-center">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="mb-2 text-2xl font-bold">
              {event.price_per_seat},00 EUR pro Sitzplatz
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              Der Ticketpreis wird als Gutschein ausgegeben (z.B. für Kuchen & Getränke).
            </p>
            {isRegistrationOpen ? (
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/anmeldung">Jetzt Plätze reservieren</Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Die Anmeldung ist aktuell nicht geöffnet.
                {regStart && now < regStart && (
                  <> Start: {formatDate(event.registration_start!)}</>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
