"use server"

import { createClient } from "@/lib/supabase/server"
import { randomBytes, createHash } from "crypto"
import type { PaymentMethod } from "@/lib/types/database"

type CreateReservationInput = {
  eventId: string
  performanceId: string
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string | null
  seats: { seatId: string; guestName: string }[]
  paymentMethod: PaymentMethod
  paypalOrderId: string | null
  totalAmount: number
}

type CreateReservationResult = {
  reservationId?: string
  token?: string
  paymentReference?: string
  error?: string
}

export async function createReservation(
  input: CreateReservationInput
): Promise<CreateReservationResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) {
    return {
      reservationId: "mock-res-1",
      token: "mock-token-123",
      paymentReference: "WM-MOCK1234",
    }
  }

  const supabase = await createClient()

  // Token generieren
  const tokenBytes = randomBytes(16)
  const token = tokenBytes.toString("hex")
  const tokenHash = createHash("sha256").update(token).digest("hex")

  // Verwendungszweck generieren für Überweisung
  const refBytes = randomBytes(4).toString("hex").toUpperCase()
  const paymentReference = input.paymentMethod === "ueberweisung"
    ? `WM-${refBytes}`
    : null

  // Status abhängig von Zahlungsmethode
  const status = input.paymentMethod === "paypal" ? "bestätigt" : "reserviert"
  const paymentStatus = input.paymentMethod === "paypal" ? "bezahlt" : "ausstehend"

  // Reservierung via RPC erstellen
  const { data, error } = await supabase.rpc("create_seat_reservation", {
    p_event_id: input.eventId,
    p_performance_id: input.performanceId,
    p_contact_first_name: input.contactFirstName,
    p_contact_last_name: input.contactLastName,
    p_contact_email: input.contactEmail,
    p_contact_phone: input.contactPhone,
    p_seats: input.seats.map((s) => ({
      seat_id: s.seatId,
      guest_name: s.guestName,
    })),
    p_paypal_order_id: input.paypalOrderId || null,
    p_total_amount: input.totalAmount,
    p_confirmation_token_hash: tokenHash,
    p_payment_method: input.paymentMethod,
    p_payment_reference: paymentReference,
    p_status: status,
    p_payment_status: paymentStatus,
  })

  if (error) {
    console.error("Reservation error:", error)
    if (error.message.includes("bereits reserviert")) {
      return { error: "Einer oder mehrere Sitzplätze sind bereits vergeben. Bitte wähle andere Plätze." }
    }
    return { error: "Reservierung konnte nicht erstellt werden." }
  }

  // E-Mail senden (async, blockiert nicht)
  sendConfirmationEmail(input, data as string, token, paymentReference).catch(console.error)

  return {
    reservationId: data as string,
    token,
    paymentReference: paymentReference || undefined,
  }
}

async function sendConfirmationEmail(
  input: CreateReservationInput,
  reservationId: string,
  token: string,
  paymentReference: string | null
) {
  try {
    const { sendEmail } = await import("@/lib/email/send")
    const { reservationConfirmationEmail, transferConfirmationEmail } = await import("@/lib/email/templates")

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const confirmationUrl = `${appUrl}/anmeldung/bestaetigung?id=${reservationId}&token=${token}&method=${input.paymentMethod}`

    const emailData = input.paymentMethod === "ueberweisung"
      ? transferConfirmationEmail({
          firstName: input.contactFirstName,
          lastName: input.contactLastName,
          seatCount: input.seats.length,
          totalAmount: input.totalAmount,
          confirmationUrl,
          seats: input.seats,
          paymentReference: paymentReference!,
          validityDays: 14,
        })
      : reservationConfirmationEmail({
          firstName: input.contactFirstName,
          lastName: input.contactLastName,
          seatCount: input.seats.length,
          totalAmount: input.totalAmount,
          confirmationUrl,
          seats: input.seats,
        })

    await sendEmail({
      to: input.contactEmail,
      subject: emailData.subject,
      html: emailData.html,
    })
  } catch (err) {
    console.error("Email error:", err)
  }
}

/**
 * Gibt die reservierten Sitz-IDs für eine Performance zurück
 */
export async function getReservedSeatsForPerformance(
  performanceId: string
): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || url.includes("dein-projekt")) {
    return []
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from("reserved_seats")
    .select("seat_id")
    .eq("performance_id", performanceId)

  return (data || []).map((r) => r.seat_id)
}
