import { createClient } from "@/lib/supabase/server"

type AdminStats = {
  totalReservations: number
  confirmedReservations: number
  pendingReservations: number
  totalRevenue: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) {
    return {
      totalReservations: 42,
      confirmedReservations: 35,
      pendingReservations: 7,
      totalRevenue: 126,
    }
  }

  const supabase = await createClient()

  const { data: reservations } = await supabase
    .from("reservations")
    .select("status, total_amount")

  if (!reservations) {
    return {
      totalReservations: 0,
      confirmedReservations: 0,
      pendingReservations: 0,
      totalRevenue: 0,
    }
  }

  return {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter((r) => r.status === "bestätigt").length,
    pendingReservations: reservations.filter((r) => r.status === "reserviert").length,
    totalRevenue: reservations
      .filter((r) => r.status !== "storniert" && r.status !== "abgelaufen")
      .reduce((sum, r) => sum + (r.total_amount || 0), 0),
  }
}

export async function getReservationsList() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) {
    return []
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from("reservations")
    .select(`
      *,
      performance:performances(*),
      reserved_seats(*, seat:seats(*))
    `)
    .order("created_at", { ascending: false })

  return data || []
}
