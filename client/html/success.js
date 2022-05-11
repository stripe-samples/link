document.addEventListener('DOMContentLoaded', async (e) => {
  // Initialize Stripe.js with your publishable key.
  const {publishableKey} = await fetch("/config").then(res => res.json());
  const stripe = Stripe(publishableKey, {
    betas: ['link_beta_3'],
    apiVersion: "2020-08-27;link_beta=v1"
  });

  // Get the PaymentIntent clientSecret from query string params.
  const params = new URLSearchParams(window.location.search);
  const clientSecret = params.get('payment_intent_client_secret');

  // Retrieve the PaymentIntent.
  const {paymentIntent} = await stripe.retrievePaymentIntent(clientSecret)
  addMessage("Payment Intent Status: " + paymentIntent.status);
  addMessage(paymentIntent.id);
});
