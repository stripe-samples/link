"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get("payment_intent_client_secret");
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    if (!clientSecret) {
      setMessage("No payment information found.");
      return;
    }

    const fetchPaymentStatus = async () => {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );

      if (!stripe) {
        setMessage("Failed to load Stripe.");
        return;
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

      if (paymentIntent) {
        setMessage(`Payment Intent: ${paymentIntent.id}\nStatus: ${paymentIntent.status}`);
      } else {
        setMessage("Could not retrieve payment information.");
      }
    };

    fetchPaymentStatus();
  }, [clientSecret]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-6 text-green-600">Success</h1>

          <div className="bg-stripe-light p-4 rounded-md mb-6 text-left">
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </div>

          <Link
            href="/"
            className="block w-full bg-stripe-purple text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
          >
            Back to checkout
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
