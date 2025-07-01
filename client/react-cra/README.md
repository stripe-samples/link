# React CRA Implementation

This is a React implementation of the Stripe Link checkout demo using Create React App.

## Project Structure

```
src/
├── components/
│   ├── PaymentForm.jsx      # Payment form with Stripe Elements
│   └── PaymentSuccess.jsx   # Success page component
├── App.jsx                  # Main app with routing
├── Checkout.jsx             # Checkout page wrapper
├── Success.jsx              # Success page wrapper
└── App.test.js              # Basic test
```

## Key Features

- **PaymentForm**: Uses Stripe Elements (Link Authentication, Address, Payment)
- **Routing**: React Router for navigation between checkout and success pages

## How to Run

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production

## Dependencies

- React 19
- React Router DOM
- Stripe React Components
- Stripe JS

## Notes

- This implementation requires the server to be running on port 4242
- The app proxies API calls to the server via the `proxy` setting in package.json
