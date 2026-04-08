import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getReservationsList } from "@/lib/queries/admin"
import { formatShortDate } from "@/lib/utils"
import Link from "next/link"
import { Eye } from "lucide-react"

export const metadata = {
  title: "Reservierungen",
}

export default async function ReservierungenPage() {
  const reservations = await getReservationsList()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservierungen</h1>
        <Link href="/api/admin/export-pdf" target="_blank">
          <Button variant="outline" size="sm">
            Zahlungsübersicht (PDF)
          </Button>
        </Link>
      </div>

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
                <TableHead>Methode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead></TableHead>
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
                    {String((r.reserved_seats as unknown[])?.length || "-")}
                  </TableCell>
                  <TableCell>{r.total_amount as number},00 EUR</TableCell>
                  <TableCell className="text-sm">
                    {(r.payment_method as string) === "paypal" ? "PayPal" : "Überw."}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={(r.payment_status as string) === "bezahlt" ? "default" : "outline"}
                    >
                      {String(r.payment_status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatShortDate(r.created_at as string)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/reservierungen/${r.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
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
