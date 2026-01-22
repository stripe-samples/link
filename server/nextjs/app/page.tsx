"use client";

import { useEffect, useState } from "react";
import { StripeProvider } from "@/components/StripeProvider";
import { PaymentForm } from "@/components/PaymentForm";

export default function Home() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => console.error("Error creating payment intent:", err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Accept a payment</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {clientSecret ? (
            <StripeProvider clientSecret={clientSecret}>
              <PaymentForm />
            </StripeProvider>
          ) : (
            <div className="text-center py-8">Loading...</div>
          )}
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Test card: 4242 4242 4242 4242
        </p>
      </div>
    </main>
  );
}
