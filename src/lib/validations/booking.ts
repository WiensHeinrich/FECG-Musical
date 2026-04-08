import { z } from "zod"

export const bookingSchema = z.object({
  performanceId: z.string().min(1, "Bitte wähle einen Termin aus."),
  contactFirstName: z
    .string()
    .min(2, "Vorname muss mindestens 2 Zeichen lang sein."),
  contactLastName: z
    .string()
    .min(2, "Nachname muss mindestens 2 Zeichen lang sein."),
  contactEmail: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  contactPhone: z.string().optional(),
  selectedSeats: z
    .array(
      z.object({
        seatId: z.string(),
        guestName: z
          .string()
          .min(2, "Name muss mindestens 2 Zeichen lang sein."),
      })
    )
    .min(1, "Bitte wähle mindestens einen Sitzplatz aus."),
})

export type BookingFormData = z.infer<typeof bookingSchema>
