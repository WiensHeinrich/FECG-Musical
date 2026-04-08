"use client"

import { useCallback } from "react"
import { getSeatId, SECTION_LABELS } from "@/lib/seatmap/layout"
import type { SectionId } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SeatMapProps = {
  reservedSeats: Set<string>
  selectedSeats: string[]
  onSeatToggle: (seatId: string) => void
}

const W = 836
const H = 1140

type SeatStatus = "available" | "reserved" | "selected"

function getSeatStatus(
  seatId: string,
  reservedSeats: Set<string>,
  selectedSeats: string[]
): SeatStatus {
  if (reservedSeats.has(seatId)) return "reserved"
  if (selectedSeats.includes(seatId)) return "selected"
  return "available"
}

const statusFills: Record<SeatStatus, string> = {
  available: "#FFD700",
  reserved: "#BDBDBD",
  selected: "#00ADD6",
}

const statusHover: Record<SeatStatus, string> = {
  available: "#FFE44D",
  reserved: "#BDBDBD",
  selected: "#33C1E8",
}

const statusLabels: Record<SeatStatus, string> = {
  available: "Frei",
  reserved: "Belegt",
  selected: "Ausgewählt",
}

function SeatDot({
  seatId, cx, cy, status, section, row, seatNum, onToggle,
}: {
  seatId: string; cx: number; cy: number; status: SeatStatus
  section: string; row: number; seatNum: number | string
  onToggle: (seatId: string) => void
}) {
  const isClickable = status !== "reserved"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <rect
          x={cx - 6.5} y={cy - 6.5} width={13} height={13} rx={2}
          fill={statusFills[status]}
          stroke={status === "selected" ? "#008FAF" : "rgba(0,0,0,0.12)"}
          strokeWidth={status === "selected" ? 1.5 : 0.5}
          className={cn("transition-all duration-100", isClickable && "cursor-pointer")}
          onClick={() => isClickable && onToggle(seatId)}
          onMouseEnter={(e) => { if (isClickable) e.currentTarget.setAttribute("fill", statusHover[status]) }}
          onMouseLeave={(e) => { e.currentTarget.setAttribute("fill", statusFills[status]) }}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">{section}</p>
        <p>Reihe {row}, Platz {seatNum}</p>
        <p className="text-muted-foreground">{statusLabels[status]}</p>
      </TooltipContent>
    </Tooltip>
  )
}

type SectionLayout = {
  id: SectionId
  reverseNumbering?: boolean // Nummerierung von rechts nach links
  rows: {
    row: number; y: number; x1: number; seats: number; dx: number
    seatStart: number
    seatLabels?: string[] // Optionale individuelle Platznamen (z.B. ["210", "210a"])
    xs?: number[]
  }[]
}

// Pixelgenau aus Saal blanko_3.png (836x1140)
// Platznummern aus Saalplan_Pixelpositionen.xlsx
const SECTIONS: SectionLayout[] = [
  // PARKETT SEITE (links oben, 4 Reihen, Nummerierung rechts→links)
  {
    id: "parkett-seite",
    reverseNumbering: true,
    rows: [
      { row: 1, y: 243, x1: 59,  seats: 7,  dx: 17, seatStart: 161 },
      { row: 2, y: 269, x1: 53,  seats: 8,  dx: 17, seatStart: 168 },
      { row: 3, y: 295, x1: 44,  seats: 9,  dx: 17, seatStart: 176 },
      { row: 4, y: 321, x1: 34,  seats: 10, dx: 17, seatStart: 185 },
    ],
  },
  // HOCHPARKETT SEITE (links, 11 Reihen, Nummerierung rechts→links)
  {
    id: "seite",
    reverseNumbering: true,
    rows: [
      { row: 1,  y: 362, x1: 34,  seats: 9,  dx: 17, seatStart: 398 },
      { row: 2,  y: 395, x1: 34,  seats: 9,  dx: 17, seatStart: 407 },
      { row: 3,  y: 427, x1: 34,  seats: 10, dx: 17, seatStart: 416 },
      { row: 4,  y: 460, x1: 51,  seats: 10, dx: 17, seatStart: 426 },
      { row: 5,  y: 491, x1: 69,  seats: 9,  dx: 17, seatStart: 436 },
      { row: 6,  y: 521, x1: 69,  seats: 9,  dx: 17, seatStart: 445 },
      { row: 7,  y: 554, x1: 86,  seats: 8,  dx: 17, seatStart: 454 },
      { row: 8,  y: 585, x1: 86,  seats: 8,  dx: 17, seatStart: 462 },
      { row: 9,  y: 616, x1: 98,  seats: 7,  dx: 17, seatStart: 470 },
      { row: 10, y: 648, x1: 110, seats: 6,  dx: 17, seatStart: 477 },
      { row: 11, y: 681, x1: 120, seats: 5,  dx: 17, seatStart: 483 },
    ],
  },
  // PARKETT MITTE (Reihe 2-9)
  {
    id: "parkett-mitte",
    rows: [
      { row: 2, y: 171, x1: 241, seats: 19, dx: 17, seatStart: 21 },
      { row: 3, y: 202, x1: 251, seats: 19, dx: 17, seatStart: 40 },
      { row: 4, y: 232, x1: 263, seats: 18, dx: 17, seatStart: 59 },
      { row: 5, y: 263, x1: 275, seats: 18, dx: 17, seatStart: 77 },
      { row: 6, y: 293, x1: 286, seats: 17, dx: 17, seatStart: 95 },
      { row: 7, y: 323, x1: 295, seats: 17, dx: 17, seatStart: 112 },
      { row: 8, y: 354, x1: 306, seats: 8,  dx: 17, seatStart: 129 },
      { row: 9, y: 384, x1: 316, seats: 8,  dx: 17, seatStart: 145 },
    ],
  },
  // HOCHPARKETT MITTE (Reihe 1-12)
  {
    id: "mitte",
    rows: [
      { row: 1,  y: 425, x1: 292, seats: 17, dx: 17, seatStart: 195, seatLabels: ["195","196","197","198","199","200","201","202","203","204","205","206","207","208","209","210","210a"] },
      { row: 2,  y: 460, x1: 292, seats: 17, dx: 17, seatStart: 211 },
      { row: 3,  y: 492, x1: 292, seats: 17, dx: 17, seatStart: 228 },
      { row: 4,  y: 522, x1: 292, seats: 17, dx: 17, seatStart: 245 },
      { row: 5,  y: 554, x1: 292, seats: 17, dx: 17, seatStart: 262 },
      { row: 6,  y: 586, x1: 292, seats: 17, dx: 17, seatStart: 279 },
      { row: 7,  y: 616, x1: 292, seats: 17, dx: 17, seatStart: 296 },
      { row: 8,  y: 649, x1: 292, seats: 17, dx: 17, seatStart: 313 },
      { row: 9,  y: 680, x1: 292, seats: 17, dx: 17, seatStart: 330 },
      { row: 10, y: 712, x1: 292, seats: 17, dx: 17, seatStart: 347 },
      { row: 11, y: 742, x1: 292, seats: 17, dx: 17, seatStart: 364 },
      { row: 12, y: 775, x1: 292, seats: 17, dx: 17, seatStart: 381 },
    ],
  },
  // SEITENRANG (rechts, 17 Reihen)
  {
    id: "seitenrang",
    rows: [
      { row: 1,  y: 239, x1: 697, seats: 6,  dx: 17, seatStart: 488 },
      { row: 2,  y: 270, x1: 697, seats: 6,  dx: 17, seatStart: 494 },
      { row: 3,  y: 300, x1: 697, seats: 6,  dx: 18, seatStart: 500 },
      { row: 4,  y: 338, x1: 687, seats: 7,  dx: 18, seatStart: 506 },
      { row: 5,  y: 378, x1: 687, seats: 7,  dx: 18, seatStart: 513 },
      { row: 6,  y: 417, x1: 687, seats: 7,  dx: 18, seatStart: 520 },
      { row: 7,  y: 456, x1: 687, seats: 8,  dx: 18, seatStart: 527, seatLabels: ["527","528","529","530","531","532","533","533a"] },
      { row: 8,  y: 496, x1: 687, seats: 7,  dx: 18, seatStart: 534 },
      { row: 9,  y: 535, x1: 687, seats: 7,  dx: 18, seatStart: 541, seatLabels: ["541","542","543","544","545","546","546a"] },
      { row: 10, y: 575, x1: 687, seats: 6,  dx: 17, seatStart: 547 },
      { row: 11, y: 614, x1: 687, seats: 6,  dx: 17, seatStart: 553 },
      { row: 12, y: 654, x1: 687, seats: 6,  dx: 17, seatStart: 559 },
      { row: 13, y: 693, x1: 687, seats: 6,  dx: 17, seatStart: 565 },
      { row: 14, y: 731, x1: 678, seats: 7,  dx: 18, seatStart: 571 },
      { row: 15, y: 771, x1: 662, seats: 8,  dx: 17, seatStart: 578 },
      { row: 16, y: 811, x1: 655, seats: 8,  dx: 17, seatStart: 586 },
      { row: 17, y: 843, x1: 645, seats: 8,  dx: 17, seatStart: 594 },
    ],
  },
  // MITTELRANG (2 Reihen)
  {
    id: "mittelrang",
    rows: [
      { row: 1, y: 815, x1: 125, seats: 23, dx: 17, seatStart: 602, xs: [125,142,159,176,194,211,228,308,325,342,360,377,394,411,429,446,463,480,498,515,532,549,566] },
      { row: 2, y: 843, x1: 142, seats: 22, dx: 17, seatStart: 625, xs: [142,159,176,193,211,308,325,342,360,377,394,411,429,446,463,480,498,515,532,549,566,584] },
    ],
  },
  // HOCHRANG (6 Reihen)
  {
    id: "hochrang",
    rows: [
      { row: 1, y: 926,  x1: 191, seats: 25, dx: 17, seatStart: 647 },
      { row: 2, y: 957,  x1: 191, seats: 25, dx: 17, seatStart: 672 },
      { row: 3, y: 988,  x1: 191, seats: 25, dx: 17, seatStart: 697 },
      { row: 4, y: 1020, x1: 191, seats: 25, dx: 17, seatStart: 722 },
      { row: 5, y: 1050, x1: 191, seats: 25, dx: 17, seatStart: 747 },
      { row: 6, y: 1082, x1: 174, seats: 27, dx: 17, seatStart: 772 },
    ],
  },
]

export function SeatMap({ reservedSeats, selectedSeats, onSeatToggle }: SeatMapProps) {
  const handleToggle = useCallback(
    (seatId: string) => onSeatToggle(seatId),
    [onSeatToggle]
  )

  return (
    <div className="w-full overflow-x-auto">
      <div className="mx-auto w-full max-w-[836px]" style={{ minWidth: 450 }}>
        <div className="relative">
          <img
            src="/saalplan-bg.png"
            alt="Saalplan Dr.-Ernst-Hohner-Konzerthaus"
            className="block w-full h-auto"
            draggable={false}
          />
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="absolute top-0 left-0 w-full h-full"
            preserveAspectRatio="none"
          >
          {SECTIONS.map((section) => {
            const label = SECTION_LABELS[section.id]
            const reverse = section.reverseNumbering ?? false
            return section.rows.map((rowDef) =>
              Array.from({ length: rowDef.seats }, (_, seatIdx) => {
                // Bei reverseNumbering: rechts=niedrigste Nummer, links=höchste
                const numIdx = reverse ? (rowDef.seats - 1 - seatIdx) : seatIdx
                const officialSeatNum: number | string = rowDef.seatLabels
                  ? rowDef.seatLabels[numIdx]
                  : rowDef.seatStart + numIdx
                const seatId = getSeatId(section.id, rowDef.row, officialSeatNum)
                const status = getSeatStatus(seatId, reservedSeats, selectedSeats)
                const cx = rowDef.xs ? rowDef.xs[seatIdx] : rowDef.x1 + seatIdx * rowDef.dx
                return (
                  <SeatDot
                    key={seatId}
                    seatId={seatId}
                    cx={cx}
                    cy={rowDef.y}
                    status={status}
                    section={label}
                    row={rowDef.row}
                    seatNum={officialSeatNum}
                    onToggle={handleToggle}
                  />
                )
              })
            )
          })}
        </svg>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-5 justify-center text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Legende:</span>
          {[
            { color: "#FFD700", label: "Frei" },
            { color: "#00ADD6", label: "Ausgewählt" },
            { color: "#BDBDBD", label: "Belegt" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3.5 w-3.5 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
