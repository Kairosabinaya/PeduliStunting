import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToastCard } from "./toast-card";

describe("ToastCard", () => {
  it("renders the title and description", () => {
    render(
      <ToastCard
        tone="success"
        title="Data dihapus."
        description="bisa dipulihkan"
      />,
    );
    expect(screen.getByText("Data dihapus.")).toBeInTheDocument();
    expect(screen.getByText("bisa dipulihkan")).toBeInTheDocument();
  });

  it("invokes the action when its button is pressed", () => {
    const onClick = vi.fn();
    render(
      <ToastCard
        tone="success"
        title="Data dihapus."
        action={{ label: "Pulihkan", onClick }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Pulihkan" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("invokes onDismiss from the close control", () => {
    const onDismiss = vi.fn();
    render(<ToastCard title="Tersimpan." onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: /tutup notifikasi/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("uses role=alert for the error tone", () => {
    render(<ToastCard tone="error" title="Gagal." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Gagal.");
  });
});
