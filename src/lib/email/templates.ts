type ConfirmationEmailData = {
  firstName: string
  lastName: string
  seatCount: number
  totalAmount: number
  confirmationUrl: string
  seats: { seatId: string; guestName: string }[]
}

type TransferEmailData = ConfirmationEmailData & {
  paymentReference: string
  validityDays: number
}

function seatTable(seats: { seatId: string; guestName: string }[]) {
  return seats
    .map(
      (s) =>
        `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${s.guestName}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${s.seatId}</td></tr>`
    )
    .join("")
}

function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <div style="border-top:4px solid #00ADD6;padding:20px 0;">
    <h1 style="color:#00ADD6;margin:0;">Weihnachtsmusical</h1>
  </div>
  ${content}
  <p style="margin-top:30px;font-size:12px;color:#999;">
    Bei Fragen wende dich bitte an den Veranstalter.
  </p>
</body>
</html>`
}

/** E-Mail für PayPal-Zahlung (sofort bestätigt) */
export function reservationConfirmationEmail(data: ConfirmationEmailData) {
  const subject = `Reservierung bestätigt - Weihnachtsmusical (${data.seatCount} Platz/Plätze)`

  const html = emailWrapper(`
  <p style="color:#666;margin:4px 0 0;">Reservierungsbestätigung</p>
  <p>Hallo ${data.firstName} ${data.lastName},</p>
  <p>vielen Dank für deine Reservierung! Deine Zahlung per PayPal wurde bestätigt.</p>

  <div style="background:#f8f8f8;padding:16px;border-radius:8px;margin:20px 0;">
    <p style="margin:0;"><strong>${data.seatCount} Sitzplatz/Sitzplätze</strong></p>
    <p style="margin:8px 0 0;font-size:20px;font-weight:bold;color:#00ADD6;">${data.totalAmount},00 EUR bezahlt</p>
    <p style="margin:4px 0 0;font-size:12px;color:#666;">Der Betrag wird als Gutschein ausgegeben.</p>
  </div>

  <h3>Deine Sitzplätze:</h3>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:8px 12px;text-align:left;">Name</th>
        <th style="padding:8px 12px;text-align:left;">Platz</th>
      </tr>
    </thead>
    <tbody>${seatTable(data.seats)}</tbody>
  </table>

  <p style="margin-top:20px;">
    <a href="${data.confirmationUrl}" style="display:inline-block;padding:12px 24px;background:#00ADD6;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Reservierung anzeigen</a>
  </p>

  <p style="margin-top:20px;font-size:12px;color:#999;">
    Deine Gutscheine erhältst du am Tag der Aufführung an der Kasse.
  </p>`)

  return { subject, html }
}

/** E-Mail für Überweisung (noch nicht bezahlt) */
export function transferConfirmationEmail(data: TransferEmailData) {
  const subject = `Reservierung vorgemerkt - Weihnachtsmusical (${data.seatCount} Platz/Plätze)`

  const html = emailWrapper(`
  <p style="color:#666;margin:4px 0 0;">Reservierung - Zahlung per Überweisung</p>
  <p>Hallo ${data.firstName} ${data.lastName},</p>
  <p>vielen Dank für deine Reservierung! Deine Plätze sind für <strong>${data.validityDays} Tage</strong> reserviert.</p>
  <p><strong>Bitte überweise den Betrag innerhalb von ${data.validityDays} Tagen</strong>, damit deine Reservierung bestätigt wird.</p>

  <div style="background:#fff3cd;padding:16px;border-radius:8px;margin:20px 0;border:1px solid #ffc107;">
    <h3 style="margin:0 0 12px 0;color:#856404;">Überweisungsdaten</h3>
    <table style="width:100%;font-size:14px;">
      <tr><td style="padding:4px 0;color:#666;">Betrag:</td><td style="padding:4px 0;font-weight:bold;font-size:18px;">${data.totalAmount},00 EUR</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Verwendungszweck:</td><td style="padding:4px 0;font-weight:bold;font-family:monospace;font-size:16px;">${data.paymentReference}</td></tr>
    </table>
    <p style="margin:12px 0 0;font-size:12px;color:#856404;">
      Bitte gib unbedingt den Verwendungszweck <strong>${data.paymentReference}</strong> an, damit wir die Zahlung zuordnen können.
    </p>
  </div>

  <div style="background:#f8f8f8;padding:16px;border-radius:8px;margin:20px 0;">
    <p style="margin:0;"><strong>${data.seatCount} Sitzplatz/Sitzplätze</strong></p>
    <p style="margin:4px 0 0;font-size:12px;color:#666;">Der Betrag wird als Gutschein ausgegeben.</p>
  </div>

  <h3>Deine Sitzplätze:</h3>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:8px 12px;text-align:left;">Name</th>
        <th style="padding:8px 12px;text-align:left;">Platz</th>
      </tr>
    </thead>
    <tbody>${seatTable(data.seats)}</tbody>
  </table>

  <p style="margin-top:20px;">
    <a href="${data.confirmationUrl}" style="display:inline-block;padding:12px 24px;background:#00ADD6;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Reservierung anzeigen</a>
  </p>

  <p style="margin-top:20px;font-size:12px;color:#999;">
    Deine Gutscheine erhältst du am Tag der Aufführung an der Kasse.
    Ohne Zahlungseingang innerhalb von ${data.validityDays} Tagen verfällt die Reservierung automatisch.
  </p>`)

  return { subject, html }
}
