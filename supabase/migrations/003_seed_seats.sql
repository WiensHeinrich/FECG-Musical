-- =============================================
-- Sitzplätze des Dr.-Ernst-Hohner-Konzerthaus einfügen
-- Format: section:row:seat
-- =============================================

-- Hilfsfunktion zum Batch-Einfügen
CREATE OR REPLACE FUNCTION insert_seats(
  p_section TEXT,
  p_row INT,
  p_seat_count INT,
  p_wheelchair_seats INT[] DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..p_seat_count LOOP
    INSERT INTO seats (id, section, row, seat_number, is_wheelchair)
    VALUES (
      p_section || ':' || p_row || ':' || i,
      p_section,
      p_row,
      i,
      i = ANY(p_wheelchair_seats)
    );
  END LOOP;
END;
$$;

-- PARKETT MITTE
SELECT insert_seats('parkett-mitte', 1, 15);
SELECT insert_seats('parkett-mitte', 2, 18);
SELECT insert_seats('parkett-mitte', 3, 20);
SELECT insert_seats('parkett-mitte', 4, 20);
SELECT insert_seats('parkett-mitte', 5, 18);

-- PARKETT SEITE (mit Rollstuhlplätzen in Reihe 1)
SELECT insert_seats('parkett-seite', 1, 7, '{1,2}');
SELECT insert_seats('parkett-seite', 2, 8);

-- SEITENRANG
SELECT insert_seats('seitenrang', 1, 6);
SELECT insert_seats('seitenrang', 2, 6);
SELECT insert_seats('seitenrang', 3, 6);
SELECT insert_seats('seitenrang', 4, 6);
SELECT insert_seats('seitenrang', 5, 7);
SELECT insert_seats('seitenrang', 6, 7);
SELECT insert_seats('seitenrang', 7, 7);
SELECT insert_seats('seitenrang', 8, 7);
SELECT insert_seats('seitenrang', 9, 7);
SELECT insert_seats('seitenrang', 10, 7);
SELECT insert_seats('seitenrang', 11, 7);
SELECT insert_seats('seitenrang', 12, 6);
SELECT insert_seats('seitenrang', 13, 6);
SELECT insert_seats('seitenrang', 14, 6);
SELECT insert_seats('seitenrang', 15, 6);
SELECT insert_seats('seitenrang', 16, 5);
SELECT insert_seats('seitenrang', 17, 5);

-- SEITE
SELECT insert_seats('seite', 1, 5);
SELECT insert_seats('seite', 2, 5);
SELECT insert_seats('seite', 3, 6);
SELECT insert_seats('seite', 4, 6);
SELECT insert_seats('seite', 5, 7);
SELECT insert_seats('seite', 6, 7);
SELECT insert_seats('seite', 7, 7);
SELECT insert_seats('seite', 8, 7);
SELECT insert_seats('seite', 9, 6);
SELECT insert_seats('seite', 10, 6);
SELECT insert_seats('seite', 11, 5);

-- MITTE
SELECT insert_seats('mitte', 3, 20);
SELECT insert_seats('mitte', 4, 22);
SELECT insert_seats('mitte', 5, 22);
SELECT insert_seats('mitte', 6, 22);
SELECT insert_seats('mitte', 7, 22);
SELECT insert_seats('mitte', 8, 20);

-- HOCHPARKETT
SELECT insert_seats('hochparkett', 10, 18);
SELECT insert_seats('hochparkett', 11, 16);

-- MITTELRANG
SELECT insert_seats('mittelrang', 1, 24);
SELECT insert_seats('mittelrang', 2, 24);
SELECT insert_seats('mittelrang', 3, 22);
SELECT insert_seats('mittelrang', 4, 22);

-- HOCHRANG
SELECT insert_seats('hochrang', 1, 22);
SELECT insert_seats('hochrang', 2, 22);
SELECT insert_seats('hochrang', 3, 20);
SELECT insert_seats('hochrang', 4, 20);
SELECT insert_seats('hochrang', 5, 18);

-- Hilfsfunktion wieder löschen
DROP FUNCTION insert_seats;
