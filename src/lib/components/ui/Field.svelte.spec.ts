import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

import Field from "./Field.svelte";
import TestWrapper from "./TestWrapper.svelte";

describe("Field", () => {
  it("renders label and children content", () => {
    render(TestWrapper, {
      props: {
        component: Field,
        props: { label: "Username" },
        text: "Input placeholder"
      }
    });

    // Check label text is visible
    expect(screen.getByText("Username")).toBeTruthy();
    // Check children slot is rendered
    expect(screen.getByText("Input placeholder")).toBeTruthy();
  });
});
