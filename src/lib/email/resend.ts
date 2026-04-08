import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY

export const resend =
  apiKey && !apiKey.startsWith("re_xxxx") ? new Resend(apiKey) : null

export const EMAIL_FROM = "Weihnachtsmusical <noreply@example.com>"
export const ADMIN_EMAIL = "musical@example.com"
