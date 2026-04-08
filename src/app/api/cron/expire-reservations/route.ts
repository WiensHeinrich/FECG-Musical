import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  // Cron-Secret prüfen (Vercel sendet diesen Header)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Abgelaufene Reservierungen finden und Status ändern
    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "abgelaufen" })
      .eq("status", "reserviert")
      .lt("expires_at", new Date().toISOString())
      .select("id")

    if (error) {
      console.error("Cron error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const count = data?.length || 0
    console.log(`[Cron] ${count} Reservierungen abgelaufen`)

    return NextResponse.json({
      success: true,
      expired: count,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Cron error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
