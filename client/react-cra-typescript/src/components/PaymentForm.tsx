import { useState, FormEvent } from "react";
import {
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

export const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, setMessages] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessages("Stripe has not loaded yet. Please try again.");
      return;
    }

    setMessages("Submitting payment...");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/success",
      },
    });

    if (error) {
      setMessages(`Error: ${error.message}`);
    }
  };

  return (
    <div className="sr-root">
      <div className="sr-main">
        <h1>Accept a payment</h1>

        <form onSubmit={handleSubmit}>
          <h3>Contact info</h3>
          <LinkAuthenticationElement
          // Access the email value like so:
          // onChange={(event) => {
          //  setEmail(event.value.email);
          // }}
          //
          // Prefill the email field like so:
          // options={{defaultValues: {email: 'foo@bar.com'}}}
          />

          <h3>Shipping address</h3>
          <AddressElement
            options={{ mode: "shipping", allowedCountries: ["US"] }}

            // Access the address like so:
            // onChange={(event) => {
            //   setAddressState(event.value);
            // }}
          />

          <h3>Payment</h3>
          <PaymentElement />
          <button type="submit">Pay</button>
        </form>

        {messages && <div id="messages">{messages}</div>}
      </div>
    </div>
  );
};
