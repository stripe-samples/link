import { Elements } from "@stripe/react-stripe-js";
import { PaymentSuccess } from "./components/PaymentSuccess";

export const Success = ({ stripePromise }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentSuccess />
    </Elements>
  );
};
