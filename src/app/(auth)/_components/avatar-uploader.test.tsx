import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AUTH_LABELS } from "@/config/auth";

// The uploader posts FormData to the Server Action, which is unavailable
// in the unit-test environment. We replace the action with a stub that
// records the call and returns a deterministic result so the component
// renders the success branch.
vi.mock("@/app/(auth)/auth/sign-up/actions", () => ({
  uploadPendingAvatar: vi.fn(async () => ({
    ok: true,
    pendingPath: "_signup/00000000-0000-0000-0000-000000000000.jpg",
    publicUrl:
      "https://example.test/storage/v1/object/public/avatars/_signup/00000000-0000-0000-0000-000000000000.jpg",
  })),
}));

import { AvatarUploader } from "./avatar-uploader";

function makeFile(
  bytes: number,
  type = "image/jpeg",
  name = "avatar.jpg",
): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("AvatarUploader", () => {
  it("renders the upload CTA and hint", () => {
    render(<AvatarUploader displayName="Budi" />);
    expect(screen.getByText(AUTH_LABELS.avatar.label)).toBeInTheDocument();
    expect(screen.getByText(AUTH_LABELS.avatar.upload)).toBeInTheDocument();
    expect(screen.getByText(AUTH_LABELS.avatar.hint)).toBeInTheDocument();
  });

  it("rejects an oversize file with an inline error", () => {
    render(<AvatarUploader displayName="Budi" />);
    const fileInput = screen.getByLabelText(AUTH_LABELS.avatar.label, {
      selector: "input",
    });
    fireEvent.change(fileInput, {
      target: { files: [makeFile(3 * 1024 * 1024)] },
    });
    expect(screen.getByRole("alert").textContent).toMatch(/maksimal 2 MB/iu);
  });

  it("rejects a disallowed MIME type", () => {
    render(<AvatarUploader displayName="Budi" />);
    const fileInput = screen.getByLabelText(AUTH_LABELS.avatar.label, {
      selector: "input",
    });
    fileInput.removeAttribute("accept");
    fireEvent.change(fileInput, {
      target: { files: [makeFile(8 * 1024, "image/gif", "avatar.gif")] },
    });
    expect(screen.getByRole("alert").textContent).toMatch(
      /JPG, PNG, atau WebP/iu,
    );
  });

  it("rejects a too-small file", () => {
    render(<AvatarUploader displayName="Budi" />);
    const fileInput = screen.getByLabelText(AUTH_LABELS.avatar.label, {
      selector: "input",
    });
    fireEvent.change(fileInput, {
      target: { files: [makeFile(128)] },
    });
    expect(screen.getByRole("alert").textContent).toMatch(/terlalu kecil/iu);
  });
});
