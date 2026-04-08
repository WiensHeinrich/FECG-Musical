"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

type PayPalCheckoutProps = {
  clientId: string
  amount: number
  currency: string
  onSuccess: (orderId: string) => void
  onError: (message: string) => void
}

export function PayPalCheckout({
  clientId,
  amount,
  currency,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency,
        intent: "capture",
        locale: "de_DE",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "pay",
        }}
        createOrder={(_data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: currency,
                },
                description: "Weihnachtsmusical - Sitzplatzreservierung",
              },
            ],
          })
        }}
        onApprove={async (_data, actions) => {
          try {
            const details = await actions.order!.capture()
            onSuccess(details.id!)
          } catch {
            onError("Zahlung konnte nicht abgeschlossen werden.")
          }
        }}
        onError={() => {
          onError("PayPal-Fehler aufgetreten.")
        }}
        onCancel={() => {
          onError("Zahlung wurde abgebrochen.")
        }}
      />
    </PayPalScriptProvider>
  )
}
