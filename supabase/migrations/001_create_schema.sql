-- =============================================
-- Weihnachtsmusical - Datenbank-Schema
-- =============================================

-- Status-Enums
CREATE TYPE reservation_status AS ENUM ('reserviert', 'bestätigt', 'storniert', 'abgelaufen');
CREATE TYPE payment_status AS ENUM ('ausstehend', 'bezahlt', 'erstattet');
CREATE TYPE waitlist_status AS ENUM ('wartend', 'benachrichtigt', 'abgelaufen', 'umgewandelt');

-- =============================================
-- Events (Musical-Veranstaltungen)
-- =============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  contact_email TEXT,
  contact_phone TEXT,
  price_per_seat NUMERIC(10,2) NOT NULL DEFAULT 3.00,
  paypal_client_id TEXT,
  paypal_currency TEXT NOT NULL DEFAULT 'EUR',
  reservation_validity_days INT NOT NULL DEFAULT 14,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nur ein aktives Event gleichzeitig
CREATE UNIQUE INDEX idx_events_active ON events (is_active) WHERE is_active = true;

-- =============================================
-- Performances (Aufführungstermine)
-- =============================================
CREATE TABLE performances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  doors_open TIME,
  notes TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_performances_event ON performances(event_id);

-- =============================================
-- Seats (Sitzplätze im Saal)
-- =============================================
CREATE TABLE seats (
  id TEXT PRIMARY KEY,  -- Format: "section:row:seat" z.B. "parkett-mitte:2:15"
  section TEXT NOT NULL,
  row INT NOT NULL,
  seat_number INT NOT NULL,
  is_wheelchair BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(section, row, seat_number)
);

CREATE INDEX idx_seats_section ON seats(section);

-- =============================================
-- Reservations (Buchungen)
-- =============================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status reservation_status NOT NULL DEFAULT 'reserviert',
  payment_status payment_status NOT NULL DEFAULT 'ausstehend',
  paypal_order_id TEXT,
  paypal_transaction_id TEXT,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  confirmation_token_hash TEXT,
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservations_event ON reservations(event_id);
CREATE INDEX idx_reservations_performance ON reservations(performance_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- =============================================
-- Reserved Seats (Reservierte Sitzplätze)
-- =============================================
CREATE TABLE reserved_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  seat_id TEXT NOT NULL REFERENCES seats(id),
  guest_name TEXT NOT NULL,
  performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ein Sitz kann pro Aufführung nur einmal reserviert werden
CREATE UNIQUE INDEX idx_reserved_seats_unique
  ON reserved_seats(seat_id, performance_id)
  WHERE EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id = reservation_id
    AND r.status IN ('reserviert', 'bestätigt')
  );

-- Alternativer, einfacherer Unique-Index (ohne Subquery)
-- Wir nutzen stattdessen einen Check in der RPC-Funktion
DROP INDEX IF EXISTS idx_reserved_seats_unique;

CREATE INDEX idx_reserved_seats_reservation ON reserved_seats(reservation_id);
CREATE INDEX idx_reserved_seats_performance ON reserved_seats(performance_id);
CREATE INDEX idx_reserved_seats_seat ON reserved_seats(seat_id);

-- =============================================
-- Waitlist (Warteliste)
-- =============================================
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  performance_id UUID NOT NULL REFERENCES performances(id) ON DELETE CASCADE,
  contact_first_name TEXT NOT NULL,
  contact_last_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  seat_count INT NOT NULL DEFAULT 1,
  position INT NOT NULL,
  status waitlist_status NOT NULL DEFAULT 'wartend',
  notes TEXT,
  converted_reservation_id UUID REFERENCES reservations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_waitlist_performance ON waitlist(performance_id);

-- =============================================
-- Admin Users
-- =============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Updated-At Trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_waitlist_updated_at BEFORE UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
