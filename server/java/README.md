# Java Server Implementation

A Java implementation of the Stripe Link checkout server using Spark Java framework and Gradle.

## Requirements

- Java 8 or higher
- Gradle (or use the Gradle Wrapper)

## How to run

1. Set up your environment variables

First, create a `.env` file by copying the example file:

```bash
cp ../../.env.example .env
```

Then edit the `.env` file and add your Stripe API keys:

```bash
# Stripe API keys - get these from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Webhook secret - see https://stripe.com/docs/webhooks/signatures
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Path to front-end implementation
STATIC_DIR=../../client/html
```

**Important:** Replace the placeholder values with your actual Stripe API keys. You can find these in your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).

2. Set up Gradle (if you don't have it installed)

If you don't have Gradle installed, you can install it via:

- **macOS:** `brew install gradle`
- **Ubuntu/Debian:** `sudo apt install gradle`
- **Windows:** Download from https://gradle.org/install/

3. Build and run the application

```bash
# If you have Gradle installed globally:
gradle build
gradle run

# Or if you prefer to use the Gradle Wrapper (recommended):
./gradlew build
./gradlew run
```

4. Alternative: Run the packaged JAR

```bash
# Build the JAR first
./gradlew jar

# Then run it
java -jar build/libs/java-1.0.0-SNAPSHOT.jar
```

5. Go to `localhost:4242` to see the demo

## Available Scripts

- `gradle build` or `./gradlew build` - Builds the application
- `gradle run` or `./gradlew run` - Runs the server directly
- `gradle jar` or `./gradlew jar` - Creates a runnable JAR file
- `gradle clean` or `./gradlew clean` - Cleans build artifacts

## Dependencies

- **Spark Java** - Lightweight web framework
- **Stripe Java** - Official Stripe Java library
- **Gson** - JSON serialization/deserialization
- **Java Dotenv** - Environment variable loading

## Project Structure

```
server/java/
├── build.gradle              # Gradle build configuration
├── src/main/java/
│   └── com/stripe/sample/
│       └── Server.java       # Main server implementation
└── README.md                 # This file
```

## Notes

- This implementation requires the client to be running (HTML, React, etc.)
- The server proxies API calls and serves static files from the client directory
- Webhook handling is included for payment status updates
- Uses the same port (4242) as other server implementations
