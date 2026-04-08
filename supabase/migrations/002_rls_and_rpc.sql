-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Events: öffentlich lesbar
CREATE POLICY "Events öffentlich lesbar" ON events
  FOR SELECT USING (true);

-- Performances: öffentlich lesbar
CREATE POLICY "Performances öffentlich lesbar" ON performances
  FOR SELECT USING (true);

-- Seats: öffentlich lesbar
CREATE POLICY "Seats öffentlich lesbar" ON seats
  FOR SELECT USING (true);

-- Reserved Seats: öffentlich lesbar (um belegte Plätze zu sehen)
CREATE POLICY "Reserved Seats öffentlich lesbar" ON reserved_seats
  FOR SELECT USING (true);

-- Reservations: nur eigene via Token oder Admin (öffentlich lesbar für Statusanzeige)
CREATE POLICY "Reservations eigene lesen" ON reservations
  FOR SELECT USING (true);

-- Admin-Zugriff für alle Tabellen
CREATE POLICY "Admin voll auf events" ON events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Admin voll auf performances" ON performances
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Admin voll auf reservations" ON reservations
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Admin voll auf reserved_seats" ON reserved_seats
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Admin voll auf waitlist" ON waitlist
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Admin voll auf admin_users" ON admin_users
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true
  ));

-- =============================================
-- RPC: is_admin()
-- =============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
END;
$$;

-- =============================================
-- RPC: create_seat_reservation()
-- Erstellt eine Reservierung mit Sitzplätzen
-- =============================================
CREATE OR REPLACE FUNCTION create_seat_reservation(
  p_event_id UUID,
  p_performance_id UUID,
  p_contact_first_name TEXT,
  p_contact_last_name TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT,
  p_seats JSONB,
  p_paypal_order_id TEXT,
  p_total_amount NUMERIC,
  p_confirmation_token_hash TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reservation_id UUID;
  v_seat JSONB;
  v_seat_id TEXT;
  v_expires_at TIMESTAMPTZ;
  v_validity_days INT;
  v_conflict_count INT;
BEGIN
  -- Gültigkeitsdauer holen
  SELECT reservation_validity_days INTO v_validity_days
  FROM events WHERE id = p_event_id;

  v_expires_at := now() + (COALESCE(v_validity_days, 14) || ' days')::INTERVAL;

  -- Prüfen ob Sitze bereits reserviert sind (mit Lock)
  SELECT COUNT(*) INTO v_conflict_count
  FROM reserved_seats rs
  JOIN reservations r ON r.id = rs.reservation_id
  WHERE rs.performance_id = p_performance_id
    AND r.status IN ('reserviert', 'bestätigt')
    AND rs.seat_id IN (
      SELECT s->>'seat_id' FROM jsonb_array_elements(p_seats) s
    )
  FOR UPDATE;

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'Einer oder mehrere Sitzplätze sind bereits reserviert.';
  END IF;

  -- Reservierung erstellen
  INSERT INTO reservations (
    event_id, performance_id,
    contact_first_name, contact_last_name, contact_email, contact_phone,
    status, payment_status,
    paypal_order_id, total_amount,
    confirmation_token_hash, expires_at
  ) VALUES (
    p_event_id, p_performance_id,
    p_contact_first_name, p_contact_last_name, p_contact_email, p_contact_phone,
    'bestätigt', 'bezahlt',
    p_paypal_order_id, p_total_amount,
    p_confirmation_token_hash, v_expires_at
  ) RETURNING id INTO v_reservation_id;

  -- Sitzplätze reservieren
  FOR v_seat IN SELECT * FROM jsonb_array_elements(p_seats) LOOP
    v_seat_id := v_seat->>'seat_id';

    INSERT INTO reserved_seats (reservation_id, seat_id, guest_name, performance_id)
    VALUES (v_reservation_id, v_seat_id, v_seat->>'guest_name', p_performance_id);
  END LOOP;

  RETURN v_reservation_id;
END;
$$;
