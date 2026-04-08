import { createClient } from "@/lib/supabase/server"
import type { PerformanceWithAvailability } from "@/lib/types/database"
import { getMockPerformances } from "./mock-data"

export async function getPerformancesWithAvailability(
  eventId: string
): Promise<PerformanceWithAvailability[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) {
    return getMockPerformances()
  }

  const supabase = await createClient()

  const { data: performances } = await supabase
    .from("performances")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order")

  if (!performances) return []

  const { data: reservationCounts } = await supabase
    .from("reservations")
    .select("performance_id, seat_count")
    .eq("event_id", eventId)
    .in("status", ["reserviert", "bestätigt"])

  return performances.map((p) => {
    const reserved = (reservationCounts || [])
      .filter((r) => r.performance_id === p.id)
      .reduce((sum, r) => sum + r.seat_count, 0)

    return {
      ...p,
      reserved_seats: reserved,
      available_seats: p.max_seats - reserved,
    }
  })
}
