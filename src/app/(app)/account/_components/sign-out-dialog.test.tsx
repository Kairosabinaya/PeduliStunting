import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ACCOUNT_SIGN_OUT_COPY } from "@/config/account";

import { SignOutDialog } from "./sign-out-dialog";

const signOutMock = vi.fn<() => Promise<void>>();

vi.mock("@/app/(auth)/actions", () => ({
  signOut: () => signOutMock(),
}));

beforeEach(() => {
  signOutMock.mockReset();
  signOutMock.mockResolvedValue(undefined);
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(
      this: HTMLDialogElement,
    ) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close(
      this: HTMLDialogElement,
    ) {
      this.removeAttribute("open");
    };
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("SignOutDialog", () => {
  it("does not render the dialog content until the trigger is clicked", () => {
    render(<SignOutDialog />);
    expect(
      screen.queryByRole("heading", {
        name: ACCOUNT_SIGN_OUT_COPY.dialogTitle,
      }),
    ).not.toBeInTheDocument();
  });

  it("opens the dialog when the trigger is clicked", () => {
    render(<SignOutDialog />);
    fireEvent.click(
      screen.getByRole("button", { name: ACCOUNT_SIGN_OUT_COPY.triggerLabel }),
    );
    expect(
      screen.getByRole("heading", { name: ACCOUNT_SIGN_OUT_COPY.dialogTitle }),
    ).toBeInTheDocument();
  });

  it("closes the dialog when cancel is clicked without invoking signOut", () => {
    render(<SignOutDialog />);
    fireEvent.click(
      screen.getByRole("button", { name: ACCOUNT_SIGN_OUT_COPY.triggerLabel }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: ACCOUNT_SIGN_OUT_COPY.cancelLabel }),
    );
    expect(signOutMock).not.toHaveBeenCalled();
  });
});
