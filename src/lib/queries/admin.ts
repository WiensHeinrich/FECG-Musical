import { createClient } from "@/lib/supabase/server"

type AdminStats = {
  totalReservations: number
  confirmedReservations: number
  pendingReservations: number
  cancelledReservations: number
  totalRevenue: number
  pendingPayments: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) {
    return {
      totalReservations: 42,
      confirmedReservations: 35,
      pendingReservations: 7,
      cancelledReservations: 0,
      totalRevenue: 126,
      pendingPayments: 21,
    }
  }

  const supabase = await createClient()

  const { data: reservations } = await supabase
    .from("reservations")
    .select("status, payment_status, total_amount")

  if (!reservations) {
    return {
      totalReservations: 0,
      confirmedReservations: 0,
      pendingReservations: 0,
      cancelledReservations: 0,
      totalRevenue: 0,
      pendingPayments: 0,
    }
  }

  return {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter((r) => r.status === "bestätigt").length,
    pendingReservations: reservations.filter((r) => r.status === "reserviert").length,
    cancelledReservations: reservations.filter((r) => r.status === "storniert").length,
    totalRevenue: reservations
      .filter((r) => r.payment_status === "bezahlt")
      .reduce((sum, r) => sum + (r.total_amount || 0), 0),
    pendingPayments: reservations
      .filter((r) => r.status === "reserviert" && r.payment_status === "ausstehend")
      .reduce((sum, r) => sum + (r.total_amount || 0), 0),
  }
}

export async function getReservationsList() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) return []

  const supabase = await createClient()

  const { data } = await supabase
    .from("reservations")
    .select(`
      *,
      performance:performances(*)
    `)
    .order("created_at", { ascending: false })

  return data || []
}

export async function getReservationDetail(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) return null

  const supabase = await createClient()

  const { data } = await supabase
    .from("reservations")
    .select(`
      *,
      performance:performances(*),
      reserved_seats(*)
    `)
    .eq("id", id)
    .single()

  return data
}
