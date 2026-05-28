import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./avatar";

describe("Avatar primitive", () => {
  it("renders an <img> when a src is provided", () => {
    render(
      <Avatar
        src="https://example.test/storage/v1/object/public/avatars/users/x/y.jpg"
        displayName="Budi Santoso"
        size="lg"
      />,
    );
    const img = screen.getByAltText("Foto profil Budi Santoso");
    expect(img.tagName).toBe("IMG");
  });

  it("renders initials when no src is provided", () => {
    render(<Avatar displayName="Budi Santoso" />);
    expect(screen.getByText("BS")).toBeInTheDocument();
  });

  it("falls back to email when display name is empty", () => {
    render(<Avatar email="anita@example.com" />);
    expect(screen.getByText("AN")).toBeInTheDocument();
  });

  it("uses the PS fallback when nothing identifies the user", () => {
    render(<Avatar />);
    expect(screen.getByText("PS")).toBeInTheDocument();
  });

  it("applies the requested size variant", () => {
    const { container } = render(<Avatar displayName="X" size="2xl" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toMatch(/h-24/u);
    expect(wrapper?.className).toMatch(/w-24/u);
  });

  it("applies the requested ring variant", () => {
    const { container } = render(<Avatar displayName="X" ring="accent" />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toMatch(/ring-brand-400/u);
  });

  it("uses a custom alt prop when provided", () => {
    render(
      <Avatar
        src="https://example.test/storage/v1/object/public/avatars/users/x/y.jpg"
        displayName="Budi"
        alt="Foto profil khusus"
      />,
    );
    expect(screen.getByAltText("Foto profil khusus")).toBeInTheDocument();
  });
});
