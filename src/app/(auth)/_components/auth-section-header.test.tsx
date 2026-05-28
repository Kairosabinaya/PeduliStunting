import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthSectionHeader } from "./auth-section-header";

describe("AuthSectionHeader", () => {
  it("renders the eyebrow, title (as h1), and description", () => {
    render(
      <AuthSectionHeader
        eyebrow="Selamat datang"
        title="Masuk ke akun Anda"
        description="Lanjutkan memantau pertumbuhan anak."
      />,
    );
    expect(screen.getByText("Selamat datang")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /masuk ke akun anda/iu }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/lanjutkan memantau pertumbuhan anak/iu),
    ).toBeInTheDocument();
  });

  it("forwards the children slot below the description", () => {
    render(
      <AuthSectionHeader
        eyebrow="Daftar"
        title="Mulai dengan satu langkah"
        description="Bergabung gratis."
      >
        <div data-testid="stepper-slot">stepper</div>
      </AuthSectionHeader>,
    );
    expect(screen.getByTestId("stepper-slot")).toBeInTheDocument();
  });
});
