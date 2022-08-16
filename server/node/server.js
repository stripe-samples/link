const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const { resolve } = require('path');
// Replace if using a different env file or config
const env = require('dotenv').config({ path: './.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/link-with-stripe",
    version: "0.0.1",
    url: "https://github.com/stripe-samples/link-with-stripe",
  }
});

app.use(express.static(process.env.STATIC_DIR));

// need cookieParser middleware so that we can persist the Link session.
app.use(cookieParser());
const linkPersistentTokenCookieName = 'stripe.link.persistent_token';

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    }
  })
);

app.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});

app.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post('/create-payment-intent', async (req, res) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999,
      currency: 'usd',

      // Best practice is to enable Link through the dashboard
      // and use automatic payment methods. For this demo,
      // we explicitly pass payment_method_types: ['link', 'card'],
      // to be extra clear which payment method types are enabled.
      //
      //   automatic_payment_methods: { enabled: true },
      //
      payment_method_types: ['link', 'card'],

      // Optionally, include the link persistent token for the cookied
      // Link session.
      payment_method_options: {
        link: {
          persistent_token: req.cookies[linkPersistentTokenCookieName],
        }
      }
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret
    });

  } catch(e) {
    return res.status(400).send({
      error: {
        message: e.message
      }
    });
  }
});

app.get('/payment/next', async (req, res) => {
  const intent = await stripe.paymentIntents.retrieve(
    req.query.payment_intent,
    {
      expand: ["payment_method"],
    }
  );
  const status = intent.status;

  if (status === "succeeded" || status === "processing") {
    // If a valid Link session (created during the Link authentication flow
    // by the Payment Element code) is associated with the PaymentIntent, it
    // will be made available on the Payment Method object.
    const linkPersistentToken = intent.payment_method?.link?.persistent_token;

    if (!!linkPersistentToken) {
      // Set the cookie from the value returned on the PaymentIntent.
      res.cookie(linkPersistentTokenCookieName,
        linkPersistentToken,
        {
          sameSite: 'strict',
          secure: true,
          httpOnly: true,
          expires: new Date(Date.now() + 90 * 24 * 3600 * 1000),
        }
      );
    }
  }

  res.redirect(`/success?payment_intent_client_secret=${intent.client_secret}`);
});

app.get('/success', async (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/success.html');
  res.sendFile(path);
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks
app.post('/webhook', async (req, res) => {
  let data, eventType;

  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // we can retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === 'payment_intent.succeeded') {
    // Funds have been captured
    // Fulfill any orders, e-mail receipts, etc
    // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
    console.log('💰 Payment captured!');
  } else if (eventType === 'payment_intent.payment_failed') {
    console.log('❌ Payment failed.');
  }
  res.sendStatus(200);
});

app.listen(4242, () => console.log(`Node server listening at http://localhost:4242`));
