import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { DELETE_CHILD_COPY } from "@/config/tracker";

import { DeleteChildButton } from "./delete-child-button";

const softDeleteChildMock =
  vi.fn<(previous: unknown, formData: FormData) => Promise<unknown>>();
const restoreChildMock = vi.fn();

vi.mock("@/app/(app)/tracker/actions", () => ({
  softDeleteChild: (previous: unknown, formData: FormData) =>
    softDeleteChildMock(previous, formData),
  restoreChild: (childId: string) => restoreChildMock(childId),
}));

// The island now navigates on success and fires an undo toast; both are
// stubbed since these tests only cover the open/confirm/cancel surface.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  softDeleteChildMock.mockReset();
  softDeleteChildMock.mockResolvedValue(null);
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

const CHILD_ID = "00000000-0000-0000-0000-000000000002";
const CHILD_NAME = "Aira";

describe("DeleteChildButton", () => {
  it("does not show the confirmation until the trigger is clicked", () => {
    render(<DeleteChildButton childId={CHILD_ID} childName={CHILD_NAME} />);
    expect(
      screen.queryByRole("heading", { name: DELETE_CHILD_COPY.title }),
    ).not.toBeInTheDocument();
  });

  it("opens the confirmation dialog when the trigger is clicked", () => {
    render(<DeleteChildButton childId={CHILD_ID} childName={CHILD_NAME} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: DELETE_CHILD_COPY.triggerAriaLabel(CHILD_NAME),
      }),
    );
    expect(
      screen.getByRole("heading", { name: DELETE_CHILD_COPY.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(DELETE_CHILD_COPY.confirmBody(CHILD_NAME)),
    ).toBeInTheDocument();
  });

  it("closes the dialog on cancel without invoking the delete action", () => {
    render(<DeleteChildButton childId={CHILD_ID} childName={CHILD_NAME} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: DELETE_CHILD_COPY.triggerAriaLabel(CHILD_NAME),
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_CHILD_COPY.cancel }),
    );
    expect(softDeleteChildMock).not.toHaveBeenCalled();
  });

  it("submits the child id when the deletion is confirmed", () => {
    render(<DeleteChildButton childId={CHILD_ID} childName={CHILD_NAME} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: DELETE_CHILD_COPY.triggerAriaLabel(CHILD_NAME),
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: DELETE_CHILD_COPY.confirm }),
    );
    expect(softDeleteChildMock).toHaveBeenCalledTimes(1);
    const formData = softDeleteChildMock.mock.calls[0]?.[1];
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get("childId")).toBe(CHILD_ID);
  });
});
