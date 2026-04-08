import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Bestätigung",
}

export default async function BestaetigungPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string; method?: string }>
}) {
  const { id, method } = await searchParams
  const isTransfer = method === "ueberweisung"

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader className="text-center">
            {isTransfer ? (
              <Clock className="mx-auto h-12 w-12 text-amber-500" />
            ) : (
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            )}
            <CardTitle className="mt-4 text-2xl">
              {isTransfer ? "Reservierung vorgemerkt!" : "Reservierung erfolgreich!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {isTransfer ? (
              <>
                <p className="text-muted-foreground">
                  Deine Sitzplätze wurden reserviert. Bitte überweise den Betrag
                  innerhalb der angegebenen Frist, damit die Reservierung bestätigt wird.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm">
                  <p className="font-semibold text-amber-800">Wichtig:</p>
                  <p className="mt-1 text-amber-700">
                    Du erhältst eine E-Mail mit den Überweisungsdaten und dem Verwendungszweck.
                    Ohne Zahlungseingang verfällt die Reservierung automatisch.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Deine Sitzplätze wurden erfolgreich reserviert und bezahlt.
                Du erhältst eine Bestätigungs-E-Mail mit allen Details.
              </p>
            )}

            {id && (
              <p className="text-sm text-muted-foreground">
                Reservierungsnummer: <span className="font-mono font-medium">{id.slice(0, 8).toUpperCase()}</span>
              </p>
            )}

            <p className="text-sm text-muted-foreground">
              Deine Gutscheine erhältst du am Tag der Aufführung an der Kasse.
            </p>

            <div className="pt-4">
              <Button asChild variant="outline">
                <Link href="/">Zurück zur Startseite</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
