import "./App.css";
import "./components.css";
import { Checkout } from "./Checkout";
import { Success } from "./Success";

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { loadStripe, Stripe } from "@stripe/stripe-js";

function App() {
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    fetch("/config")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { publishableKey } = await response.json();
        setStripePromise(loadStripe(publishableKey));
      })
      .catch((error) => {
        console.error("Error loading Stripe configuration:", error);
      });
  }, []);

  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Checkout stripePromise={stripePromise} />}
          />
          <Route
            path="/success"
            element={<Success stripePromise={stripePromise} />}
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
