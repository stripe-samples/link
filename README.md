# Checkout faster with Link

An [Express server](http://expressjs.com) implementation

## Requirements

- Node v10+
- [Configured .env file](../README.md)

## How to run

1. Confirm `.env` configuration

Ensure the API keys are configured in `.env` in this directory. It should include the following keys:

```yaml
# Stripe API keys - see https://stripe.com/docs/development/quickstart#api-keys
STRIPE_PUBLISHABLE_KEY=pk_test...
STRIPE_SECRET_KEY=sk_test...

# Required to verify signatures in the webhook handler.
# See README on how to use the Stripe CLI to test webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# Path to front-end implementation. Two versions are available, one in HTML and the other using crate-react-app
STATIC_DIR=../../client/html

# or

STATIC_DIR=../../client/react-cra
```

2. Install dependencies

```
npm install
```

3. Run the application

```
npm start
```

3. Go to `localhost:4242` to see the demo
