import type { SectionId } from "@/lib/types/database"

/**
 * Saalplan-Definition: Dr.-Ernst-Hohner-Konzerthaus Trossingen
 *
 * Die Daten basieren auf dem offiziellen Saalplan.
 * Jede Section hat Reihen mit einer bestimmten Anzahl Sitze.
 */

export type SectionDefinition = {
  id: SectionId
  label: string
  rows: RowDefinition[]
}

export type RowDefinition = {
  row: number
  seats: number
  startNumber?: number
  wheelchairSeats?: number[]
}

export const SECTION_LABELS: Record<SectionId, string> = {
  "parkett-mitte": "Parkett Mitte",
  "parkett-seite": "Parkett Seite",
  "seitenrang": "Seitenrang",
  "seite": "Hochparkett Seite",
  "mitte": "Hochparkett Mitte",
  "hochparkett": "Hochparkett Mitte",
  "mittelrang": "Mittelrang",
  "hochrang": "Hochrang",
}

export const HALL_SECTIONS: SectionDefinition[] = [
  {
    id: "parkett-seite",
    label: "Parkett Seite",
    rows: [
      { row: 1, seats: 7, wheelchairSeats: [1, 2] },
      { row: 2, seats: 8 },
      { row: 3, seats: 9 },
      { row: 4, seats: 10 },
    ],
  },
  {
    id: "seite",
    label: "Hochparkett Seite",
    rows: [
      { row: 1, seats: 9 },
      { row: 2, seats: 9 },
      { row: 3, seats: 10 },
      { row: 4, seats: 10 },
      { row: 5, seats: 9 },
      { row: 6, seats: 9 },
      { row: 7, seats: 8 },
      { row: 8, seats: 8 },
      { row: 9, seats: 7 },
      { row: 10, seats: 6 },
      { row: 11, seats: 5 },
    ],
  },
  {
    id: "parkett-mitte",
    label: "Parkett Mitte",
    rows: [
      { row: 2, seats: 19 },
      { row: 3, seats: 19 },
      { row: 4, seats: 18 },
      { row: 5, seats: 18 },
      { row: 6, seats: 17 },
      { row: 7, seats: 17 },
      { row: 8, seats: 8 },
      { row: 9, seats: 8 },
    ],
  },
  {
    id: "mitte",
    label: "Hochparkett Mitte",
    rows: [
      { row: 1, seats: 17 },
      { row: 2, seats: 17 },
      { row: 3, seats: 17 },
      { row: 4, seats: 17 },
      { row: 5, seats: 17 },
      { row: 6, seats: 17 },
      { row: 7, seats: 17 },
      { row: 8, seats: 17 },
      { row: 9, seats: 17 },
      { row: 10, seats: 17 },
      { row: 11, seats: 17 },
      { row: 12, seats: 17 },
    ],
  },
  {
    id: "seitenrang",
    label: "Seitenrang",
    rows: [
      { row: 1, seats: 6 },
      { row: 2, seats: 6 },
      { row: 3, seats: 6 },
      { row: 4, seats: 7 },
      { row: 5, seats: 7 },
      { row: 6, seats: 7 },
      { row: 7, seats: 8 },
      { row: 8, seats: 7 },
      { row: 9, seats: 7 },
      { row: 10, seats: 6 },
      { row: 11, seats: 6 },
      { row: 12, seats: 6 },
      { row: 13, seats: 6 },
      { row: 14, seats: 7 },
      { row: 15, seats: 8 },
      { row: 16, seats: 8 },
      { row: 17, seats: 8 },
    ],
  },
  {
    id: "mittelrang",
    label: "Mittelrang",
    rows: [
      { row: 1, seats: 23 },
      { row: 2, seats: 22 },
    ],
  },
  {
    id: "hochrang",
    label: "Hochrang",
    rows: [
      { row: 1, seats: 25 },
      { row: 2, seats: 25 },
      { row: 3, seats: 25 },
      { row: 4, seats: 25 },
      { row: 5, seats: 25 },
      { row: 6, seats: 27 },
    ],
  },
]

/**
 * Generiert alle Sitz-IDs für eine Section/Reihe
 * Format: "section:row:seat" z.B. "parkett-mitte:2:15"
 */
export function getSeatId(section: SectionId, row: number, seatNumber: number | string): string {
  return `${section}:${row}:${seatNumber}`
}

export function parseSeatId(seatId: string): { section: SectionId; row: number; seat: number } {
  const [section, row, seat] = seatId.split(":")
  return { section: section as SectionId, row: parseInt(row), seat: parseInt(seat) }
}

/**
 * Gibt die Gesamtzahl aller Sitze im Saal zurück
 */
export function getTotalSeats(): number {
  return HALL_SECTIONS.reduce(
    (total, section) =>
      total + section.rows.reduce((rowTotal, row) => rowTotal + row.seats, 0),
    0
  )
}

/**
 * Generiert die vollständige Liste aller Sitz-IDs
 */
export function getAllSeatIds(): string[] {
  const seats: string[] = []
  for (const section of HALL_SECTIONS) {
    for (const row of section.rows) {
      for (let s = 1; s <= row.seats; s++) {
        seats.push(getSeatId(section.id, row.row, s))
      }
    }
  }
  return seats
}
