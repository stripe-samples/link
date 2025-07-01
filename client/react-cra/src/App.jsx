import "./App.css";
import "./components.css";
import { Checkout } from "./Checkout";
import { Success } from "./Success";

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { loadStripe } from "@stripe/stripe-js";

function App() {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    fetch("/config").then(async (response) => {
      const { publishableKey } = await response.json();
      setStripePromise(loadStripe(publishableKey));
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
