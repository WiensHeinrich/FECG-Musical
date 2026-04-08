import { resend, EMAIL_FROM } from "./resend"

type SendEmailOptions = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log(`[Email] Übersprungen (kein API-Key). An: ${to}, Betreff: ${subject}`)
    return
  }

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  })

  if (error) {
    console.error("[Email] Fehler:", error)
    throw error
  }
}
