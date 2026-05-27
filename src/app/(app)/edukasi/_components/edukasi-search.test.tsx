import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EDUCATION_COPY } from "@/config/education";

import type { ParsedEdukasiFilters } from "../_lib/filters";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const { EdukasiSearch } = await import("./edukasi-search");

const emptyFilters: ParsedEdukasiFilters = {
  topic: undefined,
  agePresetKey: undefined,
  search: undefined,
  page: 1,
};

describe("EdukasiSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pushMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a labelled search input with the current filter value", () => {
    render(
      <EdukasiSearch filters={{ ...emptyFilters, search: "asi" }} />,
    );
    const input = screen.getByLabelText(EDUCATION_COPY.searchLabel);
    expect(input).toHaveValue("asi");
  });

  it("does not push while the typed value is shorter than the minimum length", () => {
    render(<EdukasiSearch filters={emptyFilters} />);
    const input = screen.getByLabelText(EDUCATION_COPY.searchLabel);
    fireEvent.change(input, { target: { value: "a" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("debounces and pushes the URL once the query crosses the threshold", () => {
    render(<EdukasiSearch filters={emptyFilters} />);
    const input = screen.getByLabelText(EDUCATION_COPY.searchLabel);

    fireEvent.change(input, { target: { value: "as" } });
    expect(pushMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(pushMock).toHaveBeenCalledTimes(1);
    const [href, options] = pushMock.mock.calls[0] ?? [];
    expect(href).toBe("/edukasi?cari=as");
    expect(options).toEqual({ scroll: false });
  });

  it("clears the search param when the input is emptied", () => {
    render(<EdukasiSearch filters={{ ...emptyFilters, search: "asi" }} />);
    const input = screen.getByLabelText(EDUCATION_COPY.searchLabel);
    fireEvent.change(input, { target: { value: "" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock.mock.calls[0]?.[0]).toBe("/edukasi");
  });

  it("submits immediately on form submit (Enter key)", () => {
    render(<EdukasiSearch filters={emptyFilters} />);
    const input = screen.getByLabelText(EDUCATION_COPY.searchLabel);
    fireEvent.change(input, { target: { value: "imunisasi" } });
    const form = input.closest("form");
    if (!form) throw new Error("expected the input to be wrapped in a <form>");
    pushMock.mockClear();
    fireEvent.submit(form);
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock.mock.calls[0]?.[0]).toBe("/edukasi?cari=imunisasi");
  });
});
