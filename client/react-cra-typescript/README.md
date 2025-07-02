# React CRA TypeScript Implementation

This is a TypeScript implementation of the _Stripe Link checkout demo_ using Create React App with TypeScript template.

## Project Structure

```
src/
├── components/
│   ├── PaymentForm.tsx      # Payment form with Stripe Elements
│   └── PaymentSuccess.tsx   # Success page component
├── App.tsx                  # Main app with routing
├── Checkout.tsx             # Checkout page wrapper
├── Success.tsx              # Success page wrapper
├── components.css           # Styling for components
└── App.test.tsx             # Basic test
```

## Key Features

- **PaymentForm**: Uses Stripe Elements (Link Authentication, Address, Payment) with proper typing
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
- `npm run eject` - Ejects from Create React App (not recommended)

## Dependencies

- React 19 with TypeScript
- React Router DOM
- Stripe React Components (with types)
- Stripe JS (with types)

## TypeScript Configuration

The project uses the default TypeScript configuration from Create React App with:

- Strict mode enabled
- Proper module resolution
- Type checking for all files

## Notes

- This implementation requires the server to be running on port 4242
- The app proxies API calls to the server via the `proxy` setting in package.json
