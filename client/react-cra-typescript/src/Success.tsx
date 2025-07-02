import { Elements } from "@stripe/react-stripe-js";
import { PaymentSuccess } from "./components/PaymentSuccess";

interface SuccessProps {
  stripePromise: Promise<any> | null;
}

export const Success: React.FC<SuccessProps> = ({ stripePromise }) => {
  if (!stripePromise) {
    return <div>Loading...</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentSuccess />
    </Elements>
  );
};
