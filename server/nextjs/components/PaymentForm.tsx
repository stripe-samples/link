"use client";

import { useState, FormEvent } from "react";
import {
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe has not loaded yet. Please try again.");
      return;
    }

    setIsProcessing(true);
    setMessage("Submitting payment...");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Contact info</h3>
        <LinkAuthenticationElement />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Shipping address</h3>
        <AddressElement options={{ mode: "shipping", allowedCountries: ["US"] }} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Payment</h3>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-stripe-purple text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : "Pay"}
      </button>

      {message && (
        <div className="mt-4 p-4 bg-stripe-light rounded-md text-sm">
          {message}
        </div>
      )}
    </form>
  );
}
