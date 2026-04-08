"use client"

import type { PerformanceWithAvailability } from "@/lib/types/database"
import { formatDate, formatTime, formatWeekday } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Calendar, Clock } from "lucide-react"

type PerformanceSelectProps = {
  performances: PerformanceWithAvailability[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PerformanceSelect({
  performances,
  selectedId,
  onSelect,
}: PerformanceSelectProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {performances.map((perf) => {
        const isSelected = selectedId === perf.id
        const isSoldOut = perf.available_seats <= 0
        return (
          <Card
            key={perf.id}
            className={cn(
              "cursor-pointer transition-all",
              isSelected && "border-primary ring-2 ring-primary/20",
              isSoldOut && "cursor-not-allowed opacity-50",
              !isSelected && !isSoldOut && "hover:border-primary/50"
            )}
            onClick={() => !isSoldOut && onSelect(perf.id)}
          >
            <CardContent className="p-4">
              <p className="font-semibold">
                {perf.title || formatWeekday(perf.date)}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(perf.date)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatTime(`2000-01-01T${perf.time}`)}</span>
              </div>
              <p className="mt-2 text-xs">
                {isSoldOut ? (
                  <span className="font-medium text-destructive">Ausverkauft</span>
                ) : (
                  <span className="text-muted-foreground">
                    {perf.available_seats} Plätze frei
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
