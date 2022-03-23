document.addEventListener('DOMContentLoaded', async (e) => {
  const {publishableKey} = await fetch("/config").then(res => res.json());

  const stripe = Stripe(publishableKey, {
    betas: ['link_beta_2'],
    apiVersion: "2020-08-27;link_beta=v1"
  });

  const {clientSecret} = await fetch("/create-payment-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  }).then(res => res.json());

  addMessage(`Client secret: ${clientSecret}`);

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

  // Create an elements group from the Stripe instance, passing the clientSecret (obtained in step 2) and appearance (optional).
  const elements = stripe.elements({clientSecret, appearance});

  // Create and mount the Payment Element
  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");


  // Create and mount the linkAuthentication Element
  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");

  // If the customer's email is known when the page is loaded, you can
  // pass the email to the linkAuthenticationElement on mount:
  //
  //   linkAuthenticationElement.mount("#link-authentication-element",  {
  //     defaultValues: {
  //       email: 'jenny.rosen@example.com',
  //     }
  //   })

  // If you need access to the email address entered:
  //
  //  linkAuthenticationElement.on('change', (event) => {
  //    const email = event.value.email;
  //    console.log({ email });
  //  })


  // Create and mount the Shipping Address Element
  const shippingAddressElement = elements.create("shippingAddress", {allowedCountries: ['US']});
  shippingAddressElement.mount("#shipping-address-element");

  // If you need access to the shipping address entered
  //
  //  shippingAddressElement.on('change', (event) => {
  //    const address = event.value;
  //    console.log({ address });
  //  })

  const form = document.getElementById('payment-form');
  form.addEventListener('submit', async (event) => {
    addMessage('Submitting payment...');
    event.preventDefault();

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:4242/success",
      }
    });

    if (error) {
      // Show error to your customer (for example, payment details incomplete)
      console.log(error.message);
      addMessage(`Error: ${error.message}`);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  })
})
