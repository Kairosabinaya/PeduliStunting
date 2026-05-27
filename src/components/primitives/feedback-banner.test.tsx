import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeedbackBanner } from "./feedback-banner";

describe("FeedbackBanner", () => {
  it("renders the message", () => {
    render(<FeedbackBanner tone="info">Pesan informasi</FeedbackBanner>);
    expect(screen.getByText("Pesan informasi")).toBeInTheDocument();
  });

  it("uses role=alert for error tone so screen readers announce immediately", () => {
    render(<FeedbackBanner tone="error">Terjadi kesalahan</FeedbackBanner>);
    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("Terjadi kesalahan");
  });

  it("uses role=status for non-error tones", () => {
    render(<FeedbackBanner tone="success">Berhasil</FeedbackBanner>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("respects an explicit role override", () => {
    render(
      <FeedbackBanner tone="success" role="alert">
        Penting
      </FeedbackBanner>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
