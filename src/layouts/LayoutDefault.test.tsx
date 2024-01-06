import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LayoutDefault } from "@/layouts/LayoutDefault";

describe("<LayoutDefault />", () => {
  it("renders the header link and tagline", () => {
    render(<LayoutDefault>...</LayoutDefault>);
    const header = within(screen.getAllByRole("banner")[0]);

    expect(header.getByRole("link", { name: /Iconish/i })).toBeVisible();

    expect(
      header.getByRole("heading", {
        level: 1,
        name: /align and minify svg icon sets/i,
      })
    ).toBeVisible();
  });
});
