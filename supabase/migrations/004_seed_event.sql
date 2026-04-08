-- =============================================
-- Beispiel-Event und Aufführungen
-- Hier Werte anpassen!
-- =============================================

INSERT INTO events (
  title, slug, description, location,
  registration_start, registration_end,
  contact_email, price_per_seat,
  paypal_client_id, paypal_currency,
  reservation_validity_days, is_active
) VALUES (
  'Weihnachtsmusical 2026',
  'weihnachtsmusical-2026',
  'Erleben Sie unser Weihnachtsmusical - eine besondere Aufführung für die ganze Familie im Dr.-Ernst-Hohner-Konzerthaus Trossingen.',
  'Dr.-Ernst-Hohner-Konzerthaus, Trossingen',
  '2026-09-01 00:00:00+02',
  '2026-12-20 23:59:59+02',
  'musical@fecg-trossingen.de',
  3.00,
  NULL,  -- PayPal Client ID hier eintragen wenn vorhanden
  'EUR',
  14,
  true
);

-- Aufführungstermine (Beispiel - anpassen!)
INSERT INTO performances (event_id, title, date, time, doors_open, sort_order)
SELECT
  id,
  'Freitag-Aufführung',
  '2026-12-18',
  '19:00',
  '18:30',
  1
FROM events WHERE slug = 'weihnachtsmusical-2026';

INSERT INTO performances (event_id, title, date, time, doors_open, sort_order)
SELECT
  id,
  'Samstag-Aufführung',
  '2026-12-19',
  '17:00',
  '16:30',
  2
FROM events WHERE slug = 'weihnachtsmusical-2026';

INSERT INTO performances (event_id, title, date, time, doors_open, sort_order)
SELECT
  id,
  'Sonntag-Aufführung',
  '2026-12-20',
  '15:00',
  '14:30',
  3
FROM events WHERE slug = 'weihnachtsmusical-2026';
