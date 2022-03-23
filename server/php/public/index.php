<?php
require './shared.php';

try {
  $linkOptions = [];
  if(isset($_COOKIE['stripe_link_persistent_token'])) {
    $linkOptions = ['persistent_token' => $_COOKIE['stripe_link_persistent_token']];
  }

  $paymentIntent = $stripe->paymentIntents->create([
    'amount' => 1999,
    'currency' => 'usd',

    // Best practice is to enable Link through the dashboard
    // and use automatic payment methods. For this demo,
    // we explicitly pass payment_method_types: ['link', 'card'],
    // to be extra clear which payment method types are enabled.
    //
    //   'automatic_payment_methods' => [ 'enabled' => true ],
    //
    'payment_method_types' => ['link', 'card'],

    // Optionally, include the link persistent token for the cookied
    // Link session.
    'payment_method_options' => [
      'link' => $linkOptions,
    ]
  ]);
} catch (\Stripe\Exception\ApiErrorException $e) {
  http_response_code(400);
  error_log($e->getError()->message);
?>
  <h1>Error</h1>
  <p>Failed to create a PaymentIntent</p>
  <p>Please check the server logs for more information</p>
<?php
  exit;
} catch (Exception $e) {
  error_log($e);
  http_response_code(500);
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Link with Stripe</title>
    <meta name="description" content="A demo of Stripe" />

    <link rel="icon" href="favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="css/normalize.css" />
    <link rel="stylesheet" href="css/global.css" />
    <script src="https://js.stripe.com/v3/"></script>
    <script src="/utils.js"></script>
  </head>
  <body>
    <div class="sr-root">
      <div class="sr-main">
        <h1>Accept a payment</h1>

        <form id="payment-form">
          <h3>Contact info</h3>
          <div id="link-authentication-element"></div>

          <h3>Shipping</h3>
          <div id="shipping-address-element"></div>

          <h3>Payment</h3>
          <div id="payment-element"></div>

          <button id="submit">Pay</button>
        </form>

        <div id="messages"></div>
      </div>
    </div>
    <script>
      document.addEventListener('DOMContentLoaded', async (e) => {
        const stripe = Stripe('<?= $_ENV["STRIPE_PUBLISHABLE_KEY"] ?>', {
          betas: ['link_beta_2'],
          apiVersion: "2020-08-27;link_beta=v1"
        });

        const clientSecret = '<?= $paymentIntent->client_secret ?>';
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
              return_url: "http://localhost:4242/success.php",
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
    </script>
  </body>
</html>

