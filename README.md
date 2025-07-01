# Checkout faster with Link

A sample project that uses the following elements to build a checkout form:

- 🔐 Link Authentication Element
- 📦 Shipping Address Element
- 💳 Payment Element

The implementations are intentionally kept simple to highlight how to use Stripe Elements to quickly build a checkout form. For both client and server implementations, we’ve provided a few options—pick one of each and refer to the README files in their respective directories for setup instructions.

## Requirements

- Node v10+
- Configured `.env` file

## How to run

1. Set up your environment variables

First, create a `.env` file by copying the example file:

```bash
cp .env.example .env
```

Then edit the `.env` file and add your Stripe API keys:

```bash
# Stripe API keys - get these from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Webhook secret - see https://stripe.com/docs/webhooks/signatures
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Path to front-end implementation
STATIC_DIR=client/html
```

**Important:** Replace the placeholder values with your actual Stripe API keys. You can find these in your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).

2. Pick an option for your server
   go to the [server](./server/) directory, pick one option and follow the README instructions in that directory to set that up. Then run your server.

3. Pick an option for your client

go to the [client](./client/) directory, pick one option and follow its instructions.

4. Go to `localhost:4242` to see the demo
