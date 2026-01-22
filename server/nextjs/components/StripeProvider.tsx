"use client";

import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/get-stripe";
import { StripeElementsOptions } from "@stripe/stripe-js";

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#ed5f74",
        borderRadius: "20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, sans-serif",
        colorBackground: "#fafafa",
      },
    },
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      {children}
    </Elements>
  );
}
