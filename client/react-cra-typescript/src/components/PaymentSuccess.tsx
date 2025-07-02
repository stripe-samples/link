import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";

export const PaymentSuccess: React.FC = () => {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<string>("");

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = searchParams.get("payment_intent_client_secret");
    if (clientSecret) {
      const retrievePayment = async () => {
        try {
          const { paymentIntent } = await stripe.retrievePaymentIntent(
            clientSecret
          );
          if (paymentIntent) {
            setMessages(`Payment Intent: ${paymentIntent.id}`);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          setMessages(`Error retrieving payment: ${errorMessage}`);
        }
      };

      retrievePayment();
    }
  }, [searchParams, stripe]);

  return (
    <div className="sr-root">
      <div className="sr-main">
        <h1>Success</h1>

        {messages && (
          <div id="messages" style={{ display: "block" }}>
            {messages}
          </div>
        )}

        <a href="/">Back to checkout</a>
      </div>
    </div>
  );
};
