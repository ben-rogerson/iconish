import { initialConfig } from "@/hooks/appState";
import { transformSvg } from "./transformSvg";
import { describe, it, expect } from "vitest";

describe("transformSvg", () => {
  it("should keep the svg id attr and identify the id", () => {
    const svg = '<svg id="svgId"></svg>';

    const { output, id } = transformSvg(svg, "", initialConfig);

    expect(output).toBe('<svg id="svgId"/>');
    expect(id).toBe("svgId");
  });

  it("should return undefined for id when no id attribute and no title", () => {
    const svg = "<svg></svg>";

    const { output, id } = transformSvg(svg, "", initialConfig);

    expect(output).toBe("<svg/>");
    expect(id).toBeUndefined();
  });

  it("should return undefined for id when no svg tag", () => {
    const svg = "<div></div>";

    const { output, id } = transformSvg(svg, "title", initialConfig);

    expect(output).toBe("<div/>");
    expect(id).toBeUndefined();
  });

  it("should add an id when there is no svg id attr", () => {
    const svg = "<svg></svg>";

    const { output, id } = transformSvg(svg, "A title", initialConfig);

    expect(output).toBe('<svg id="a-title"/>');
    expect(id).toBe("A title");
  });

  it("should override the id when a title is provided", () => {
    const svg = '<svg id="bert"></svg>';

    const { output, id } = transformSvg(svg, "A title", initialConfig);

    expect(output).toBe('<svg id="a-title"/>');
    expect(id).toBe("A title");
  });

  it("should keep the casing of the svg id attr", () => {
    const svg = '<svg id="Bert"></svg>';

    const { output, id } = transformSvg(svg, "", initialConfig);

    expect(output).toBe('<svg id="Bert"/>');
    expect(id).toBe("Bert");
  });
});
