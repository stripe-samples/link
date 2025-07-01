import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./components/PaymentForm";

// Customize the appearance of Elements using the Appearance API.
const appearance = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "#ed5f74",
    borderRadius: "20px",
    fontFamily:
      "--body-font-family: -apple-system, BlinkMacSystemFont, sans-serif",
    colorBackground: "#fafafa",
  },
};

interface CheckoutProps {
  stripePromise: Promise<any> | null;
}

export const Checkout: React.FC<CheckoutProps> = ({ stripePromise }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({ clientSecret }) => setClientSecret(clientSecret))
      .catch((error) => {
        console.error("Error creating payment intent:", error);
      });
  }, []);

  if (clientSecret && stripePromise) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <PaymentForm />
      </Elements>
    );
  } else {
    return <div>Loading...</div>;
  }
};
