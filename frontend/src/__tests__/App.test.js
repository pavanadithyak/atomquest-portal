import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders login page on initial load", () => {
  render(<App />);
  const heading = screen.getByText(/AtomQuest Portal/i);
  expect(heading).toBeInTheDocument();
});
