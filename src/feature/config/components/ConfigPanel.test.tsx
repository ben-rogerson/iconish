import { describe, expect, it } from "vitest";
import {
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppActions } from "@/hooks/appState";
import { ConfigPanel } from "@/feature/config/components/ConfigPanel";

describe("<ConfigPanel />", () => {
  describe("stroke width", () => {
    const setup = () => {
      render(<ConfigPanel />);
      const container = within(screen.getByTestId("range-0"));
      const element = container.getByRole<HTMLSpanElement>("slider");
      const { result } = renderHook(() => useAppActions());
      return { container, element, state: result.current };
    };

    it("has default value", () => {
      const { container, element, state } = setup();
      expect(container.getByText(/stroke width/i)).toBeVisible();
      expect(element.getAttribute("aria-valuenow")).toBe("2");
      expect(state.getConfig().strokeWidth).toBe("2");
    });

    it("can be updated", async () => {
      const { element, state } = setup();

      element.focus();

      // Value can be incremented
      await userEvent.keyboard("[ArrowRight]");
      expect(element.getAttribute("aria-valuenow")).toBe("3");
      await waitFor(() => {
        expect(state.getConfig().strokeWidth).toBe("3");
      });

      // Value can be decremented
      await userEvent.keyboard("[ArrowLeft][ArrowLeft]");
      expect(element.getAttribute("aria-valuenow")).toBe("1");
      await waitFor(() => {
        expect(state.getConfig().strokeWidth).toBe("1");
      });

      // Value can not be decremented below 1
      await userEvent.keyboard("[ArrowLeft][ArrowLeft]");
      expect(element.getAttribute("aria-valuenow")).toBe("1");
      await waitFor(() => {
        expect(state.getConfig().strokeWidth).toBe("1");
      });

      // Value can not be incremented above 5
      await userEvent.keyboard(
        "[ArrowRight][ArrowRight][ArrowRight][ArrowRight][ArrowRight][ArrowRight][ArrowRight][ArrowRight][ArrowRight][ArrowRight]"
      );
      expect(element.getAttribute("aria-valuenow")).toBe("5");

      // When blurred, value remains the same
      element.blur();
      expect(element).not.toHaveFocus();
      expect(element.getAttribute("aria-valuenow")).toBe("5");
    });
  });

  describe("stroke color", () => {
    const setup = () => {
      render(<ConfigPanel />);
      const container = within(screen.getByTestId("input-1"));
      const element = container.getByRole<HTMLInputElement>("textbox");
      const { result } = renderHook(() => useAppActions());
      return { container, element, state: result.current };
    };

    it("has default value", () => {
      const { container, element } = setup();
      expect(container.getByLabelText(/stroke color/i)).toBeVisible();
      expect(element.value).toBe("currentColor");
    });

    it("can be updated", async () => {
      const { element, state } = setup();

      await userEvent.clear(element);
      await userEvent.type(element, "red");
      element.blur();

      expect(element).not.toHaveFocus();
      expect(element.value).toBe("red");
      expect(state.getConfig().stroke).toBe("red");
    });

    it("resets on invalid color", async () => {
      const { element, state } = setup();

      // Displays element value but state is not updated
      await userEvent.clear(element);
      await userEvent.type(element, "invalid");
      expect(element.value).toBe("invalid");
      expect(state.getConfig().stroke).toBe("currentColor");

      // On blur, element value is reset to default value
      await userEvent.tab();
      expect(element).not.toHaveFocus();
      expect(element.value).toBe("currentColor");
      expect(state.getConfig().stroke).toBe("currentColor");
    });
  });

  describe("fill color", () => {
    const setup = () => {
      render(<ConfigPanel />);
      const container = within(screen.getByTestId("input-2"));
      const element = container.getByRole<HTMLInputElement>("textbox");
      const { result } = renderHook(() => useAppActions());
      return { container, element, state: result.current };
    };

    it("has default value", () => {
      const { container, element } = setup();
      expect(container.getByLabelText(/fill color/i)).toBeVisible();
      expect(element.value).toBe("currentColor");
    });

    it("can be updated", async () => {
      const { element, state } = setup();

      await userEvent.clear(element);
      await userEvent.type(element, "yellow");
      element.blur();

      expect(element).not.toHaveFocus();
      expect(element.value).toBe("yellow");
      expect(state.getConfig().fill).toBe("yellow");
    });

    it("resets on invalid color", async () => {
      const { element, state } = setup();

      // Displays element value but state is not updated
      await userEvent.clear(element);
      await userEvent.type(element, "invalid");
      expect(element.value).toBe("invalid");
      expect(state.getConfig().fill).toBe("currentColor");

      // On blur, element value is reset to default value
      await userEvent.tab();
      expect(element).not.toHaveFocus();
      expect(element.value).toBe("currentColor");
      expect(state.getConfig().fill).toBe("currentColor");
    });
  });

  describe("stroke linecap", () => {
    const setup = () => {
      render(<ConfigPanel />);
      const container = within(screen.getByTestId("select-3"));
      const element = container.getByRole<HTMLButtonElement>("combobox");
      const { result } = renderHook(() => useAppActions());
      return { container, element, state: result.current };
    };

    it("has default value", () => {
      const { container, element, state } = setup();
      expect(container.getByLabelText(/stroke-linecap/i)).toBeVisible();
      expect(element.textContent).toBe("round");
      expect(element.getAttribute("aria-expanded")).toBe("false");
      expect(state.getConfig().strokeLinecap).toBe("round");
    });

    it("can be updated", async () => {
      const { element, state } = setup();

      expect(element.getAttribute("aria-expanded")).toBe("false");

      // Focus menu then un-focus doesn't update state
      element.focus();
      element.blur();
      expect(element.getAttribute("aria-expanded")).toBe("false");
      expect(element).not.toHaveFocus();
      expect(state.getConfig().strokeLinecap).toBe("round");

      // Focus menu and hits arrow down to "open the menu"
      element.focus();
      await userEvent.keyboard("[ArrowDown]");
      expect(element.getAttribute("aria-expanded")).toBe("true");
      expect(state.getConfig().strokeLinecap).toBe("round");

      // Select the menu item at the bottom
      await userEvent.keyboard("[ArrowDown][ArrowDown][ArrowDown][Enter]");
      expect(element.getAttribute("aria-expanded")).toBe("false");
      expect(element.textContent).toBe("square");
      expect(state.getConfig().strokeLinecap).toBe("square");
    });
  });

  describe("stroke linejoin", () => {
    const setup = () => {
      render(<ConfigPanel />);
      const container = within(screen.getByTestId("select-4"));
      const element = container.getByRole<HTMLButtonElement>("combobox");
      const { result } = renderHook(() => useAppActions());
      return { container, element, state: result.current };
    };

    it("has default value", () => {
      const { container, element, state } = setup();
      expect(container.getByLabelText(/stroke-linejoin/i)).toBeVisible();
      expect(element.textContent).toBe("round");
      expect(element.getAttribute("aria-expanded")).toBe("false");
      expect(state.getConfig().strokeLinejoin).toBe("round");
    });

    it("can be updated", async () => {
      const { element, state } = setup();

      expect(element.getAttribute("aria-expanded")).toBe("false");

      // Focus menu then un-focus doesn't update state
      element.focus();
      element.blur();
      expect(element.getAttribute("aria-expanded")).toBe("false");
      expect(element).not.toHaveFocus();
      expect(state.getConfig().strokeLinejoin).toBe("round");

      // Focus menu and hits arrow down to "open the menu"
      element.focus();
      await userEvent.keyboard("[ArrowUp]");
      expect(element.getAttribute("aria-expanded")).toBe("true");
      expect(state.getConfig().strokeLinejoin).toBe("round");

      // Select the menu item at the bottom
      await userEvent.keyboard("[ArrowUp][ArrowUp][ArrowUp][Enter]");
      expect(element.getAttribute("aria-expanded")).toBe("false");
      expect(element.textContent).toBe("bevel");
      expect(state.getConfig().strokeLinejoin).toBe("bevel");
    });
  });
});
