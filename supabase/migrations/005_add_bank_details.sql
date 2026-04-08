-- =============================================
-- Bankdaten für Überweisungszahlung
-- =============================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS account_holder TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS bic TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS bank_reference_prefix TEXT DEFAULT 'WM';

-- Zahlungsmethode in Reservierung speichern
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'paypal';
-- payment_method: 'paypal' oder 'ueberweisung'

-- Verwendungszweck für Überweisungen
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_reference TEXT;
