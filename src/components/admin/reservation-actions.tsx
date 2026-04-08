"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  confirmPayment,
  cancelReservation,
  extendReservation,
  revertReservationStatus,
  deleteReservation,
  updateAdminNotes,
} from "@/lib/actions/admin"
import { Check, X, Clock, Undo2, Trash2, Save } from "lucide-react"

type Props = {
  reservationId: string
  status: string
  paymentStatus: string
  adminNotes: string
}

export function ReservationActions({
  reservationId,
  status,
  paymentStatus,
  adminNotes: initialNotes,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(initialNotes)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancel, setShowCancel] = useState(false)

  const handleConfirmPayment = () => {
    startTransition(async () => {
      const result = await confirmPayment(reservationId)
      if (result.error) toast.error(result.error)
      else { toast.success("Zahlung bestätigt!"); router.refresh() }
    })
  }

  const handleCancel = () => {
    if (!cancelReason.trim()) { toast.error("Bitte Grund angeben."); return }
    startTransition(async () => {
      const result = await cancelReservation(reservationId, cancelReason)
      if (result.error) toast.error(result.error)
      else { toast.success("Reservierung storniert."); setShowCancel(false); router.refresh() }
    })
  }

  const handleExtend = () => {
    startTransition(async () => {
      const result = await extendReservation(reservationId, 7)
      if (result.error) toast.error(result.error)
      else { toast.success("Um 7 Tage verlängert."); router.refresh() }
    })
  }

  const handleRevert = () => {
    startTransition(async () => {
      const result = await revertReservationStatus(reservationId)
      if (result.error) toast.error(result.error)
      else { toast.success("Status zurückgesetzt."); router.refresh() }
    })
  }

  const handleDelete = () => {
    if (!confirm("Reservierung unwiderruflich löschen?")) return
    startTransition(async () => {
      const result = await deleteReservation(reservationId)
      if (result.error) toast.error(result.error)
      else { toast.success("Reservierung gelöscht."); router.push("/admin/reservierungen") }
    })
  }

  const handleSaveNotes = () => {
    startTransition(async () => {
      const result = await updateAdminNotes(reservationId, notes)
      if (result.error) toast.error(result.error)
      else toast.success("Notizen gespeichert.")
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktionen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {/* Zahlung bestätigen (nur bei "reserviert" + "ausstehend") */}
          {status === "reserviert" && paymentStatus === "ausstehend" && (
            <Button onClick={handleConfirmPayment} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="mr-2 h-4 w-4" />
              Zahlung bestätigen
            </Button>
          )}

          {/* Verlängern (nur bei "reserviert") */}
          {status === "reserviert" && (
            <Button variant="outline" onClick={handleExtend} disabled={isPending}>
              <Clock className="mr-2 h-4 w-4" />
              +7 Tage verlängern
            </Button>
          )}

          {/* Stornieren (bei "reserviert" oder "bestätigt") */}
          {(status === "reserviert" || status === "bestätigt") && (
            <Button variant="outline" onClick={() => setShowCancel(!showCancel)} disabled={isPending} className="text-destructive border-destructive hover:bg-destructive/10">
              <X className="mr-2 h-4 w-4" />
              Stornieren
            </Button>
          )}

          {/* Rückgängig (bei "bestätigt" oder "storniert") */}
          {(status === "bestätigt" || status === "storniert") && (
            <Button variant="outline" onClick={handleRevert} disabled={isPending}>
              <Undo2 className="mr-2 h-4 w-4" />
              Status zurücksetzen
            </Button>
          )}

          {/* Löschen */}
          <Button variant="ghost" onClick={handleDelete} disabled={isPending} className="text-destructive hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Löschen
          </Button>
        </CardContent>
      </Card>

      {/* Stornierungsgrund */}
      {showCancel && (
        <Card className="border-destructive/20">
          <CardContent className="pt-6 space-y-3">
            <Textarea
              placeholder="Grund der Stornierung..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleCancel} disabled={isPending} variant="destructive" size="sm">
                Stornierung bestätigen
              </Button>
              <Button onClick={() => setShowCancel(false)} variant="ghost" size="sm">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin-Notizen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin-Notizen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Interne Notizen..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSaveNotes} disabled={isPending} variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Notizen speichern
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
