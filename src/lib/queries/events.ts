import { createClient } from "@/lib/supabase/server"
import type { Event } from "@/lib/types/database"
import { getMockEvent } from "./mock-data"

export async function getActiveEvent(): Promise<Event | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) {
    return getMockEvent()
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .single()

  return data
}
