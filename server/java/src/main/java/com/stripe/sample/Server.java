package com.stripe.sample;

import java.util.HashMap;
import java.nio.file.Paths;
import java.nio.file.Path;
import java.nio.file.Files;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.staticFiles;
import static spark.Spark.port;

import com.google.gson.Gson;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;

import io.github.cdimascio.dotenv.Dotenv;

public class Server {
    private static final Gson GSON = new Gson();

    // Environment variable constants
    private static final String STRIPE_SECRET_KEY = "STRIPE_SECRET_KEY";
    private static final String STRIPE_PUBLISHABLE_KEY = "STRIPE_PUBLISHABLE_KEY";
    private static final String STRIPE_WEBHOOK_SECRET = "STRIPE_WEBHOOK_SECRET";
    private static final String STATIC_DIR = "STATIC_DIR";

    // Content type constants
    private static final String APPLICATION_JSON = "application/json";
    private static final String TEXT_HTML = "text/html";

    private static class FailureResponse {
        private final HashMap<String, String> error;

        public FailureResponse(String message) {
            this.error = new HashMap<String, String>();
            this.error.put("message", message);
        }
    }

    private static class CreatePaymentResponse {
        @SuppressWarnings("unused")
        private final String clientSecret;

        public CreatePaymentResponse(String clientSecret) {
            this.clientSecret = clientSecret;
        }
    }

    private static class ConfigResponse {
        @SuppressWarnings("unused")
        private final String publishableKey;

        public ConfigResponse(String publishableKey) {
            this.publishableKey = publishableKey;
        }
    }

    public static void main(String[] args) {
        // Load .env from the project root (two directories up from server/java)
        Dotenv dotenv = Dotenv.configure()
                .directory("../../")
                .load();

        // Validate required environment variables
        String stripeSecretKey = dotenv.get(STRIPE_SECRET_KEY);
        if (stripeSecretKey == null || stripeSecretKey.trim().isEmpty()) {
            System.err.println("ERROR: STRIPE_SECRET_KEY environment variable is required but not set!");
            System.err.println("Please ensure your .env file contains STRIPE_SECRET_KEY=sk_test_...");
            System.exit(1);
        }

        Stripe.apiKey = stripeSecretKey;

        // For sample support and debugging, not required for production:
        Stripe.setAppInfo(
                "stripe-samples/link",
                "0.0.1",
                "https://github.com/stripe-samples/link");

        // Serve static files from the client directory
        staticFiles.externalLocation(
                Paths.get(
                        Paths.get("").toAbsolutePath().toString(),
                        dotenv.get(STATIC_DIR)).normalize().toString());

        port(4242);

        get("/config", (request, response) -> {
            response.type(APPLICATION_JSON);
            return GSON.toJson(new ConfigResponse(dotenv.get(STRIPE_PUBLISHABLE_KEY)));
        });

        post("/create-payment-intent", (request, response) -> {
            response.type(APPLICATION_JSON);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(1999L)
                    .setCurrency("usd")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .build();

            try {
                // Create a PaymentIntent with the order amount and currency
                PaymentIntent intent = PaymentIntent.create(params);

                // Send PaymentIntent details to client
                return GSON.toJson(new CreatePaymentResponse(intent.getClientSecret()));
            } catch (StripeException e) {
                response.status(400);
                return GSON.toJson(new FailureResponse(e.getMessage()));
            } catch (Exception e) {
                response.status(500);
                return GSON.toJson(new FailureResponse(e.getMessage()));
            }
        });

        get("/payment/next", (request, response) -> {
            String paymentIntentId = request.queryParams("payment_intent");

            try {
                PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
                response.redirect("/success?payment_intent_client_secret=" + intent.getClientSecret());
                return "";
            } catch (StripeException e) {
                response.status(400);
                return GSON.toJson(new FailureResponse(e.getMessage()));
            }
        });

        get("/success", (request, response) -> {
            String staticDir = dotenv.get(STATIC_DIR);
            Path successPath = Paths.get(staticDir, "success.html");
            response.type(TEXT_HTML);
            return Files.readString(successPath);
        });

        post("/webhook", (request, response) -> {
            String payload = request.body();
            String sigHeader = request.headers("Stripe-Signature");
            String endpointSecret = dotenv.get(STRIPE_WEBHOOK_SECRET);

            Event event = null;

            try {
                event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            } catch (SignatureVerificationException e) {
                // Invalid signature
                response.status(400);
                return "";
            }

            switch (event.getType()) {
                case "payment_intent.succeeded":
                    // Fulfill any orders, e-mail receipts, etc
                    // To cancel the payment you will need to issue a Refund
                    // (https://stripe.com/docs/api/refunds)
                    System.out.println("💰 Payment captured!");
                    break;
                case "payment_intent.payment_failed":
                    System.out.println("❌ Payment failed.");
                    break;
                default:
                    // Unexpected event type
                    response.status(400);
                    return "";
            }

            response.status(200);
            return "";
        });
    }
}