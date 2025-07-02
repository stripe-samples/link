import { render } from "@testing-library/react";
import App from "./App";

test("renders app without crashing", () => {
  // Just check that the app renders without throwing an error
  render(<App />);
  // If we get here, the app rendered successfully
});
