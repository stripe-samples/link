import {useState, useEffect} from 'react';
import {loadStripe} from "@stripe/stripe-js";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, setMessages] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages(`${messages}<br />Submitting payment...`);

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/success",
      },
    });

    if (error) {
      // handle error
      setMessages(`${messages}<br />${error.message}`);
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
            options={{mode: 'shipping', allowedCountries: ['US']}}

            // Access the address like so:
            // onChange={(event) => {
            //   setAddressState(event.value);
            // }}
          />

          <h3>Payment</h3>
          <PaymentElement />
          <button type="submit">Pay</button>
        </form>

        <div id="messages">
          {messages}
        </div>
      </div>
    </div>
  );
}

// Customize the appearance of Elements using the Appearance API.
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#ed5f74',
    borderRadius: '20px',
    fontFamily: '--body-font-family: -apple-system, BlinkMacSystemFont, sans-serif',
    colorBackground: '#fafafa',
  },
};

const Checkout = ({stripePromise}) => {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(({clientSecret}) => setClientSecret(clientSecret));
  }, []);

  if(clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{clientSecret, appearance}}>
        <PaymentForm />
      </Elements>
    )
  } else {
    return <div>Loading...</div>
  }
};

export {
  Checkout
};
