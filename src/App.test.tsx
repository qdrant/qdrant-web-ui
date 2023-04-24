import { render, screen } from "@testing-library/react";

import App from "./App";
import { HashRouter } from "react-router-dom";

describe("App", () => {
  test("Simple test", async (context) => {
    render(
      <HashRouter>
        <App />
      </HashRouter>
    );
    const linkElement = screen.getByText(/Console/i);
    expect(linkElement).toBeDefined();
  });
});
