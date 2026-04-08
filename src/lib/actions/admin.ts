"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/** Zahlung bestätigen */
export async function confirmPayment(reservationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("reservations")
    .update({
      status: "bestätigt",
      payment_status: "bezahlt",
    })
    .eq("id", reservationId)

  if (error) {
    console.error("confirmPayment error:", error)
    return { error: "Zahlung konnte nicht bestätigt werden." }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/reservierungen")
  return { success: true }
}

/** Reservierung stornieren */
export async function cancelReservation(
  reservationId: string,
  reason: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("reservations")
    .update({
      status: "storniert",
      cancelled_at: new Date().toISOString(),
      admin_notes: reason,
    })
    .eq("id", reservationId)

  if (error) {
    console.error("cancelReservation error:", error)
    return { error: "Reservierung konnte nicht storniert werden." }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/reservierungen")
  return { success: true }
}

/** Reservierung verlängern */
export async function extendReservation(reservationId: string, days: number) {
  const supabase = await createClient()

  const { data: reservation } = await supabase
    .from("reservations")
    .select("expires_at")
    .eq("id", reservationId)
    .single()

  if (!reservation) return { error: "Reservierung nicht gefunden." }

  const currentExpiry = new Date(reservation.expires_at)
  const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from("reservations")
    .update({ expires_at: newExpiry.toISOString() })
    .eq("id", reservationId)

  if (error) {
    console.error("extendReservation error:", error)
    return { error: "Reservierung konnte nicht verlängert werden." }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/reservierungen")
  return { success: true }
}

/** Status rückgängig machen */
export async function revertReservationStatus(reservationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("reservations")
    .update({
      status: "reserviert",
      payment_status: "ausstehend",
      cancelled_at: null,
    })
    .eq("id", reservationId)

  if (error) {
    console.error("revertReservation error:", error)
    return { error: "Status konnte nicht zurückgesetzt werden." }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/reservierungen")
  return { success: true }
}

/** Reservierung löschen */
export async function deleteReservation(reservationId: string) {
  const supabase = await createClient()

  // Zuerst reservierte Sitze löschen
  await supabase
    .from("reserved_seats")
    .delete()
    .eq("reservation_id", reservationId)

  // Dann die Reservierung selbst
  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", reservationId)

  if (error) {
    console.error("deleteReservation error:", error)
    return { error: "Reservierung konnte nicht gelöscht werden." }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/reservierungen")
  return { success: true }
}

/** Admin-Notizen aktualisieren */
export async function updateAdminNotes(reservationId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("reservations")
    .update({ admin_notes: notes })
    .eq("id", reservationId)

  if (error) return { error: "Notizen konnten nicht gespeichert werden." }
  return { success: true }
}

/** Event-Einstellungen aktualisieren */
export async function updateEventSettings(
  eventId: string,
  data: Record<string, unknown>
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("events")
    .update(data)
    .eq("id", eventId)

  if (error) {
    console.error("updateEventSettings error:", error)
    return { error: "Einstellungen konnten nicht gespeichert werden." }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/einstellungen")
  return { success: true }
}
