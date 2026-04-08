import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket, CreditCard, Clock, Ban } from "lucide-react"
import { getAdminStats, getReservationsList } from "@/lib/queries/admin"
import { Badge } from "@/components/ui/badge"
import { formatShortDate } from "@/lib/utils"
import Link from "next/link"

export const metadata = {
  title: "Admin Dashboard",
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()
  const reservations = await getReservationsList()
  const recent = reservations.slice(0, 5)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reservierungen
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalReservations}</p>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedReservations} bestätigt, {stats.pendingReservations} ausstehend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Einnahmen
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalRevenue},00 EUR</p>
            <p className="text-xs text-muted-foreground">Bezahlte Reservierungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Zahlungen
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingPayments},00 EUR</p>
            <p className="text-xs text-muted-foreground">{stats.pendingReservations} ausstehend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storniert
            </CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.cancelledReservations}</p>
          </CardContent>
        </Card>
      </div>

      {/* Letzte Reservierungen */}
      {recent.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Letzte Reservierungen</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recent.map((r: Record<string, unknown>) => (
                  <Link
                    key={r.id as string}
                    href={`/admin/reservierungen/${r.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {r.contact_first_name as string} {r.contact_last_name as string}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {r.contact_email as string}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {r.total_amount as number},00 EUR
                      </span>
                      <Badge
                        variant={
                          r.status === "bestätigt" ? "default" :
                          r.status === "reserviert" ? "outline" :
                          "secondary"
                        }
                      >
                        {r.status as string}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
