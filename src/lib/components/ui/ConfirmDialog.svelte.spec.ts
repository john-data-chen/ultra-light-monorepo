import { render, fireEvent, screen } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";

import ConfirmDialogTest from "./ConfirmDialogTest.svelte";

describe("ConfirmDialog", () => {
  it("renders closed by default", () => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();

    const { container } = render(ConfirmDialogTest, {
      props: {
        open: false,
        onconfirm,
        oncancel
      }
    });

    const dialog = container.querySelector("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog?.hasAttribute("open")).toBe(false);
  });

  it("renders open and shows text contents", () => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();

    const { container } = render(ConfirmDialogTest, {
      props: {
        open: true,
        title: "Delete Account",
        message: "Are you sure you want to delete your account?",
        confirmLabel: "Yes, delete",
        cancelLabel: "No, keep",
        onconfirm,
        oncancel
      }
    });

    const dialog = container.querySelector("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog?.hasAttribute("open")).toBe(true);

    expect(screen.getByText("Delete Account")).toBeTruthy();
    expect(screen.getByText("Are you sure you want to delete your account?")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "No, keep" })).toBeTruthy();
  });

  it("calls onconfirm and closes the dialog when confirm is clicked", async () => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();

    const { container } = render(ConfirmDialogTest, {
      props: {
        open: true,
        confirmLabel: "Confirm",
        onconfirm,
        oncancel
      }
    });

    const dialog = container.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);

    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    await fireEvent.click(confirmBtn);

    expect(onconfirm).toHaveBeenCalledTimes(1);
    expect(oncancel).not.toHaveBeenCalled();
    expect(dialog?.hasAttribute("open")).toBe(false);
  });

  it("calls oncancel and closes the dialog when cancel is clicked", async () => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();

    const { container } = render(ConfirmDialogTest, {
      props: {
        open: true,
        cancelLabel: "Cancel",
        onconfirm,
        oncancel
      }
    });

    const dialog = container.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    await fireEvent.click(cancelBtn);

    expect(oncancel).toHaveBeenCalledTimes(1);
    expect(onconfirm).not.toHaveBeenCalled();
    expect(dialog?.hasAttribute("open")).toBe(false);
  });

  it("calls oncancel and closes when backdrop is clicked", async () => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();

    const { container } = render(ConfirmDialogTest, {
      props: {
        open: true,
        onconfirm,
        oncancel
      }
    });

    const dialog = container.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toBe(true);

    // Click directly on the <dialog> element (backdrop click)
    await fireEvent.click(dialog!);

    expect(oncancel).toHaveBeenCalledTimes(1);
    expect(dialog?.hasAttribute("open")).toBe(false);
  });
});
