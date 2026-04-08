import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAccess } from "@/lib/auth/admin"

export async function GET() {
  try {
    await requireAdminAccess()
  } catch {
    return NextResponse.redirect("/login")
  }

  const supabase = await createClient()

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .single()

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*, performance:performances(*), reserved_seats(*)")
    .in("status", ["reserviert", "bestätigt"])
    .order("created_at", { ascending: true })

  const rows = (reservations || [])
    .map(
      (r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td style="font-family:monospace">${r.payment_reference || "-"}</td>
      <td>${r.contact_first_name} ${r.contact_last_name}</td>
      <td>${r.contact_email}</td>
      <td>${r.reserved_seats?.length || 0}</td>
      <td>${r.total_amount},00 EUR</td>
      <td><span style="color:${r.payment_status === "bezahlt" ? "green" : "orange"}">${r.payment_status}</span></td>
      <td>${r.payment_method === "paypal" ? "PayPal" : "Überw."}</td>
      <td>${new Date(r.created_at).toLocaleDateString("de-DE")}</td>
    </tr>`
    )
    .join("")

  const totalAmount = (reservations || []).reduce((s, r) => s + (r.total_amount || 0), 0)
  const paidAmount = (reservations || [])
    .filter((r) => r.payment_status === "bezahlt")
    .reduce((s, r) => s + (r.total_amount || 0), 0)
  const pendingAmount = totalAmount - paidAmount

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Zahlungsübersicht - ${event?.title || "Weihnachtsmusical"}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    h1 { color: #00ADD6; margin-bottom: 4px; }
    .subtitle { color: #666; margin-bottom: 20px; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat { padding: 12px 20px; border-radius: 8px; }
    .stat-total { background: #f0f0f0; }
    .stat-paid { background: #d4edda; color: #155724; }
    .stat-pending { background: #fff3cd; color: #856404; }
    .stat-value { font-size: 20px; font-weight: bold; }
    .stat-label { font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 8px 12px; border-bottom: 1px solid #ddd; text-align: left; font-size: 13px; }
    th { background: #f8f8f8; font-weight: bold; }
    .bank { margin-top: 20px; padding: 12px; background: #f8f8f8; border-radius: 8px; font-size: 13px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${event?.title || "Weihnachtsmusical"}</h1>
  <p class="subtitle">Zahlungsübersicht - ${new Date().toLocaleDateString("de-DE")} - ${reservations?.length || 0} aktive Reservierungen</p>

  <div class="stats">
    <div class="stat stat-total">
      <div class="stat-value">${totalAmount},00 EUR</div>
      <div class="stat-label">Gesamt</div>
    </div>
    <div class="stat stat-paid">
      <div class="stat-value">${paidAmount},00 EUR</div>
      <div class="stat-label">Bezahlt</div>
    </div>
    <div class="stat stat-pending">
      <div class="stat-value">${pendingAmount},00 EUR</div>
      <div class="stat-label">Ausstehend</div>
    </div>
  </div>

  ${event?.iban ? `<div class="bank">
    <strong>Bankverbindung:</strong> ${event.account_holder || ""} | IBAN: ${event.iban} | BIC: ${event.bic || ""}
  </div>` : ""}

  <table>
    <thead>
      <tr>
        <th>Nr.</th>
        <th>Verwendungszweck</th>
        <th>Name</th>
        <th>E-Mail</th>
        <th>Plätze</th>
        <th>Betrag</th>
        <th>Zahlung</th>
        <th>Methode</th>
        <th>Datum</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
