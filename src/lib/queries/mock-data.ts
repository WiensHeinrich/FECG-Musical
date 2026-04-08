import type { Event, PerformanceWithAvailability } from "@/lib/types/database"
import { getTotalSeats } from "@/lib/seatmap/layout"

export function getMockEvent(): Event {
  return {
    id: "mock-event-1",
    title: "Weihnachtsmusical 2026",
    slug: "weihnachtsmusical-2026",
    description:
      "Erleben Sie unser Weihnachtsmusical - eine besondere Aufführung für die ganze Familie im Dr.-Ernst-Hohner-Konzerthaus Trossingen.",
    location: "Dr.-Ernst-Hohner-Konzerthaus, Trossingen",
    registration_start: "2025-01-01T00:00:00Z",
    registration_end: "2027-12-31T23:59:59Z",
    contact_email: "musical@example.com",
    contact_phone: null,
    price_per_seat: 3,
    paypal_client_id: null,
    paypal_currency: "EUR",
    account_holder: "FECG Trossingen e.V.",
    iban: "DE00 0000 0000 0000 0000 00",
    bic: "XXXXDEXX",
    bank_reference_prefix: "WM",
    reservation_validity_days: 14,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function getMockPerformances(): PerformanceWithAvailability[] {
  const total = getTotalSeats()
  return [
    {
      id: "mock-perf-1",
      event_id: "mock-event-1",
      title: "Freitag-Aufführung",
      date: "2026-12-18",
      time: "19:00",
      doors_open: "18:30",
      notes: null,
      sort_order: 1,
      created_at: new Date().toISOString(),
      reserved_seats: 45,
      available_seats: total - 45,
    },
    {
      id: "mock-perf-2",
      event_id: "mock-event-1",
      title: "Samstag-Aufführung",
      date: "2026-12-19",
      time: "17:00",
      doors_open: "16:30",
      notes: null,
      sort_order: 2,
      created_at: new Date().toISOString(),
      reserved_seats: 120,
      available_seats: total - 120,
    },
    {
      id: "mock-perf-3",
      event_id: "mock-event-1",
      title: "Sonntag-Aufführung",
      date: "2026-12-20",
      time: "15:00",
      doors_open: "14:30",
      notes: null,
      sort_order: 3,
      created_at: new Date().toISOString(),
      reserved_seats: total - 10,
      available_seats: 10,
    },
  ]
}

/** Mock: Gibt eine zufällige Auswahl reservierter Sitz-IDs zurück */
export function getMockReservedSeats(): Set<string> {
  return new Set<string>()
}
