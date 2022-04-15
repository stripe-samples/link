import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import './App.css';
import {Checkout} from './Checkout';
import {Success} from './PaymentSuccess';

function App() {
  const [ stripePromise, setStripePromise ] = useState(null);

  useEffect(() => {
    fetch("/config").then(async (r) => {
      const { publishableKey } = await r.json();
      setStripePromise(loadStripe(publishableKey, {
        betas: ['link_beta_3'],
        apiVersion: "2019-05-16;link_beta=v1"
      }));
    });
  }, []);

  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Checkout stripePromise={stripePromise} />} />
          <Route path="/success" element={<Success stripePromise={stripePromise} />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
