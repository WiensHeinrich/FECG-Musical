import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getReservationsList } from "@/lib/queries/admin"
import { formatShortDate } from "@/lib/utils"

export const metadata = {
  title: "Reservierungen",
}

const statusColors: Record<string, string> = {
  reserviert: "bg-yellow-100 text-yellow-800",
  bestätigt: "bg-emerald-100 text-emerald-800",
  storniert: "bg-red-100 text-red-800",
  abgelaufen: "bg-gray-100 text-gray-800",
}

const paymentColors: Record<string, string> = {
  ausstehend: "bg-yellow-100 text-yellow-800",
  bezahlt: "bg-emerald-100 text-emerald-800",
  erstattet: "bg-red-100 text-red-800",
}

export default async function ReservierungenPage() {
  const reservations = await getReservationsList()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reservierungen</h1>

      {reservations.length === 0 ? (
        <p className="text-muted-foreground">Noch keine Reservierungen vorhanden.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Plätze</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r: Record<string, unknown>) => (
                <TableRow key={r.id as string}>
                  <TableCell className="font-medium">
                    {r.contact_first_name as string} {r.contact_last_name as string}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.contact_email as string}
                  </TableCell>
                  <TableCell>
                    {(r.reserved_seats as unknown[])?.length || 0}
                  </TableCell>
                  <TableCell>{r.total_amount as number},00 EUR</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[r.status as string] || ""}
                    >
                      {r.status as string}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={paymentColors[r.payment_status as string] || ""}
                    >
                      {r.payment_status as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatShortDate(r.created_at as string)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
