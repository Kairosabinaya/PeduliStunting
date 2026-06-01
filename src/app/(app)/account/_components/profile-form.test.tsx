import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UserProfileDto } from "@/application/account/dtos";

import { ACCOUNT_FORM_COPY, ACCOUNT_GENERIC_ERROR } from "@/config/account";

const setThemeMock = vi.fn();
const updateProfileMock = vi.fn<
  (
    previous: unknown,
    formData: FormData,
  ) => Promise<{
    ok: boolean;
    message?: string;
    fieldErrors?: Readonly<Record<string, readonly string[]>>;
    profile?: UserProfileDto;
  }>
>();

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({
    theme: "system",
    resolvedTheme: "light",
    setTheme: setThemeMock,
    toggle: vi.fn(),
  }),
}));

// The real action transitively imports "server-only" via the composition root,
// which Vite refuses to resolve in the test environment. We stub the action
// module here so the form can be exercised in isolation.
vi.mock("../actions", () => ({
  updateProfile: (previous: unknown, formData: FormData) =>
    updateProfileMock(previous, formData),
}));

// Import AFTER vi.mock so the mocked module is what the SUT receives.
const { ProfileForm } = await import("./profile-form");

const baseProfile: UserProfileDto = {
  userId: "11111111-1111-1111-1111-111111111111",
  displayName: "Bunda Aira",
  avatarUrl: null,
  role: "user",
  themePreference: "system",
  locale: "id-ID",
};

describe("ProfileForm", () => {
  beforeEach(() => {
    updateProfileMock.mockReset();
    setThemeMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the current profile values", () => {
    render(<ProfileForm profile={baseProfile} />);
    expect(
      screen.getByLabelText(ACCOUNT_FORM_COPY.displayNameLabel),
    ).toHaveValue("Bunda Aira");
    expect(screen.getByLabelText(ACCOUNT_FORM_COPY.themeLabel)).toHaveValue(
      "system",
    );
  });

  it("submits the locale as a hidden field even though it is not editable", () => {
    const { container } = render(<ProfileForm profile={baseProfile} />);
    const hidden = container.querySelector<HTMLInputElement>(
      'input[name="locale"][type="hidden"]',
    );
    expect(hidden).not.toBeNull();
    expect(hidden).toHaveValue("id-ID");
  });

  it("disables the submit button while the form is pristine", () => {
    render(<ProfileForm profile={baseProfile} />);
    const submit = screen.getByRole("button", {
      name: ACCOUNT_FORM_COPY.submit,
    });
    expect(submit).toBeDisabled();
  });

  it("enables submit and reveals the reset button once the form is dirty", () => {
    render(<ProfileForm profile={baseProfile} />);
    fireEvent.change(
      screen.getByLabelText(ACCOUNT_FORM_COPY.displayNameLabel),
      { target: { value: "Bunda Aira Baru" } },
    );
    expect(
      screen.getByRole("button", { name: ACCOUNT_FORM_COPY.submit }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: ACCOUNT_FORM_COPY.resetDirty }),
    ).toBeInTheDocument();
  });

  it("restores the original values when the reset button is clicked", () => {
    render(<ProfileForm profile={baseProfile} />);
    const input = screen.getByLabelText(
      ACCOUNT_FORM_COPY.displayNameLabel,
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Coba ganti" } });
    expect(input).toHaveValue("Coba ganti");
    fireEvent.click(
      screen.getByRole("button", { name: ACCOUNT_FORM_COPY.resetDirty }),
    );
    expect(input).toHaveValue("Bunda Aira");
  });

  it("shows the success banner and syncs the theme when the action resolves ok", async () => {
    updateProfileMock.mockResolvedValueOnce({
      ok: true,
      profile: { ...baseProfile, themePreference: "dark" },
    });
    render(<ProfileForm profile={baseProfile} />);
    fireEvent.change(screen.getByLabelText(ACCOUNT_FORM_COPY.themeLabel), {
      target: { value: "dark" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: ACCOUNT_FORM_COPY.submit }),
    );

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(
        screen.getByText(ACCOUNT_FORM_COPY.successMessage),
      ).toBeInTheDocument();
    });
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });

  it("renders a field-level error when the action returns one", async () => {
    updateProfileMock.mockResolvedValueOnce({
      ok: false,
      message: "Periksa kembali isian Anda.",
      fieldErrors: { displayName: ["Nama tampilan tidak boleh kosong."] },
    });
    render(<ProfileForm profile={baseProfile} />);
    fireEvent.change(
      screen.getByLabelText(ACCOUNT_FORM_COPY.displayNameLabel),
      { target: { value: "  " } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: ACCOUNT_FORM_COPY.submit }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Nama tampilan tidak boleh kosong."),
      ).toBeInTheDocument();
    });
    expect(setThemeMock).not.toHaveBeenCalled();
  });

  it("renders a general error banner when the action returns a message without field errors", async () => {
    updateProfileMock.mockResolvedValueOnce({
      ok: false,
      message: ACCOUNT_GENERIC_ERROR,
    });
    render(<ProfileForm profile={baseProfile} />);
    fireEvent.change(
      screen.getByLabelText(ACCOUNT_FORM_COPY.displayNameLabel),
      { target: { value: "Coba" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: ACCOUNT_FORM_COPY.submit }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        ACCOUNT_GENERIC_ERROR,
      );
    });
  });
});
