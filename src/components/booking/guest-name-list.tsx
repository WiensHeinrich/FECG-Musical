"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { parseSeatId } from "@/lib/seatmap/layout"
import { SECTION_LABELS } from "@/lib/seatmap/layout"

type GuestNameListProps = {
  seats: { seatId: string; guestName: string }[]
  onNameChange: (seatId: string, name: string) => void
  onRemoveSeat: (seatId: string) => void
}

export function GuestNameList({
  seats,
  onNameChange,
  onRemoveSeat,
}: GuestNameListProps) {
  if (seats.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Wähle Sitzplätze auf dem Saalplan aus.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {seats.map(({ seatId, guestName }) => {
        const parsed = parseSeatId(seatId)
        const sectionLabel = SECTION_LABELS[parsed.section]
        return (
          <div key={seatId} className="flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">
                {sectionLabel}, Reihe {parsed.row}, Platz {parsed.seat}
              </Label>
              <Input
                placeholder="Name des Gastes"
                value={guestName}
                onChange={(e) => onNameChange(seatId, e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemoveSeat(seatId)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
