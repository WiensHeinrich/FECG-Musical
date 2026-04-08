export type Event = {
  id: string
  title: string
  slug: string
  description: string | null
  location: string | null
  registration_start: string | null
  registration_end: string | null
  contact_email: string | null
  contact_phone: string | null
  price_per_seat: number
  paypal_client_id: string | null
  paypal_currency: string
  account_holder: string | null
  iban: string | null
  bic: string | null
  bank_reference_prefix: string | null
  reservation_validity_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Performance = {
  id: string
  event_id: string
  title: string | null
  date: string
  time: string
  doors_open: string | null
  notes: string | null
  sort_order: number
  created_at: string
}

export type Seat = {
  id: string
  section: SectionId
  row: number
  seat_number: number
  is_wheelchair: boolean
  is_active: boolean
}

export type ReservedSeat = {
  id: string
  reservation_id: string
  seat_id: string
  guest_name: string
  performance_id: string
}

export type Reservation = {
  id: string
  event_id: string
  performance_id: string
  contact_first_name: string
  contact_last_name: string
  contact_email: string
  contact_phone: string | null
  status: ReservationStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  paypal_order_id: string | null
  paypal_transaction_id: string | null
  payment_reference: string | null
  total_amount: number
  confirmation_token_hash: string | null
  reserved_at: string
  expires_at: string | null
  cancelled_at: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type WaitlistEntry = {
  id: string
  event_id: string
  performance_id: string
  contact_first_name: string
  contact_last_name: string
  contact_email: string
  contact_phone: string | null
  seat_count: number
  position: number
  status: WaitlistStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export type AdminUser = {
  id: string
  auth_user_id: string
  email: string
  display_name: string | null
  role: string
  is_active: boolean
  created_at: string
}

// Status-Typen
export type ReservationStatus = "reserviert" | "bestätigt" | "storniert" | "abgelaufen"
export type PaymentStatus = "ausstehend" | "bezahlt" | "erstattet"
export type PaymentMethod = "paypal" | "ueberweisung"
export type WaitlistStatus = "wartend" | "benachrichtigt" | "abgelaufen" | "umgewandelt"

// Saalplan-Bereiche
export type SectionId =
  | "parkett-mitte"
  | "parkett-seite"
  | "seitenrang"
  | "seite"
  | "mitte"
  | "hochparkett"
  | "mittelrang"
  | "hochrang"

// Zusammengesetzte Typen
export type PerformanceWithEvent = Performance & {
  event: Event
}

export type ReservationWithDetails = Reservation & {
  performance: Performance
  reserved_seats: (ReservedSeat & { seat: Seat })[]
}

export type SeatWithStatus = Seat & {
  is_reserved: boolean
}

export type PerformanceWithAvailability = Performance & {
  reserved_seats: number
  available_seats: number
}
