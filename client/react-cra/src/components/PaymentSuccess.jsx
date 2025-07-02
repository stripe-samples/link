import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";

export const PaymentSuccess = () => {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState("");

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = searchParams.get("payment_intent_client_secret");
    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        setMessages(`Payment Intent: ${paymentIntent.id}`);
      });
    }
  }, [searchParams, stripe]);

  return (
    <div className="sr-root">
      <div className="sr-main">
        <h1>Success</h1>

        <div id="messages" style={{ display: "block" }}>
          {messages}
        </div>

        <a href="/">Back to checkout</a>
      </div>
    </div>
  );
};
