import { describe, it, expect } from "vitest";
import { initialConfig } from "@/hooks/appState";
import {
  fillColorTransform,
  strokeColorTransform,
  strokeLineCapTransform,
  strokeLineJoinTransform,
  strokeWidthTransform,
  svgAttributesTransform,
  vectorEffectTransform,
} from "@/feature/svg/transforms";
import { type HTMLElement } from "node-html-parser";
import { type Config } from "@/feature/config/types";

const transform = (
  fn: (doc: HTMLElement, config: Config) => HTMLElement,
  svg: string,
  config?: Partial<Record<keyof Config, string>>
) => {
  const doc = document.createElement("div") as unknown as HTMLElement;
  doc.innerHTML = svg;
  return fn(
    doc,
    config ? ({ ...initialConfig, ...config } as Config) : initialConfig
  ).querySelector("svg") as HTMLElement;
};

describe("svgAttributesTransform", () => {
  it("should convert the width and height to a viewBox", () => {
    const output = transform(
      svgAttributesTransform,
      '<svg width="50" height="25"></svg>'
    );
    expect(output.getAttribute("viewBox")).toBe("0 0 50 25");
  });

  it("should ignore adding a viewbox when a width or height is missing", () => {
    const output = transform(svgAttributesTransform, "<svg height='20'></svg>");
    const output2 = transform(svgAttributesTransform, "<svg width='20'></svg>");

    expect(output.hasAttribute("width")).toBe(false);
    expect(output.hasAttribute("height")).toBe(false);
    expect(output.getAttribute("viewBox")).toBe(null);

    expect(output2.hasAttribute("width")).toBe(false);
    expect(output2.hasAttribute("height")).toBe(false);
    expect(output2.getAttribute("viewBox")).toBe(null);
  });

  it("should remove fill attribute when not none", () => {
    const output = transform(svgAttributesTransform, '<svg fill="red"></svg>');
    expect(output.hasAttribute("fill")).toBe(false);
  });

  it("should not remove fill attribute when none", () => {
    const output = transform(svgAttributesTransform, '<svg fill="none"></svg>');
    expect(output.getAttribute("fill")).toBe("none");
  });

  it("should update stroke attribute", () => {
    const output = transform(
      svgAttributesTransform,
      '<svg stroke="red"></svg>'
    );
    expect(output.getAttribute("stroke")).toBe(initialConfig.stroke);
  });

  it("should not update stroke attribute when already set to the initial value", () => {
    const output = transform(
      svgAttributesTransform,
      `<svg stroke="${initialConfig.stroke}"></svg>`
    );
    expect(output.getAttribute("stroke")).toBe(initialConfig.stroke);
  });

  it("should not update stroke attribute when empty", () => {
    const output = transform(svgAttributesTransform, '<svg stroke=""></svg>');
    expect(output.getAttribute("stroke")).toBe("");
  });
});

describe("strokeWidthTransform", () => {
  it("should update the stroke-width on common svg element types", () => {
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width="3"><path stroke-width="3"/><line stroke-width="3"/><polygon stroke-width="3"/><polyline stroke-width="3"/><ellipse stroke-width="3"/><rect stroke-width="3"/><circle stroke-width="3"/></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe(initialConfig.strokeWidth);
    expect(output.querySelector("path")?.getAttribute("stroke-width")).toBe(
      initialConfig.strokeWidth
    );
    expect(output.querySelector("line")?.getAttribute("stroke-width")).toBe(
      initialConfig.strokeWidth
    );
    expect(output.querySelector("polygon")?.getAttribute("stroke-width")).toBe(
      initialConfig.strokeWidth
    );
    expect(output.querySelector("polyline")?.getAttribute("stroke-width")).toBe(
      initialConfig.strokeWidth
    );
    expect(output.querySelector("ellipse")?.getAttribute("stroke-width")).toBe(
      initialConfig.strokeWidth
    );
    expect(output.querySelector("rect")?.getAttribute("stroke-width")).toBe(
      initialConfig.strokeWidth
    );
    expect(output.querySelector("circle")?.getAttribute("stroke-width")).toBe(
      initialConfig.strokeWidth
    );
  });

  it("should update strokewidth attribute", () => {
    const output = transform(
      strokeWidthTransform,
      '<svg strokewidth="3"></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe(initialConfig.strokeWidth);
  });

  it("should update strokeWidth attribute", () => {
    const output = transform(
      strokeWidthTransform,
      '<svg strokeWidth="3"></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe(initialConfig.strokeWidth);
  });

  it("should not change stroke-width attribute when already set as the default", () => {
    const output = transform(
      strokeWidthTransform,
      `<svg stroke-width="${initialConfig.strokeWidth}"></svg>`
    );
    expect(output.getAttribute("stroke-width")).toBe(initialConfig.strokeWidth);
  });

  it("should update stroke-width attribute when empty", () => {
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width=""></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe("2");
  });

  it("should not update stroke-width attribute when missing", () => {
    const output = transform(strokeWidthTransform, "<svg></svg>");
    expect(output.getAttribute("stroke-width")).toBe(null);
  });

  it("should update the stroke-width attribute when invalid", () => {
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width="invalid"></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe("2");
  });
});

describe("vectorEffectTransform", () => {
  it("should add the vector-effect attribute to elements when missing", () => {
    const output = transform(
      vectorEffectTransform,
      '<svg stroke-width="3"><path /><line /><polygon /><polyline /><ellipse /><rect /><circle /></svg>'
    );
    expect(output.querySelector("path")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
    expect(output.querySelector("line")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
    expect(output.querySelector("polygon")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
    expect(
      output.querySelector("polyline")?.getAttribute("vector-effect")
    ).toBe("non-scaling-stroke");
    expect(output.querySelector("ellipse")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
    expect(output.querySelector("rect")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
    expect(output.querySelector("circle")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
  });

  it("should leave the vector-effect attribute when present", () => {
    const output = transform(
      vectorEffectTransform,
      '<svg><path vector-effect="non-scaling-stroke" /></svg>'
    );
    expect(output.querySelector("path")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
  });

  it("should not change the value of the vector-effect attribute", () => {
    const output = transform(
      vectorEffectTransform,
      '<svg><path vector-effect="a-value" /></svg>'
    );
    expect(output.querySelector("path")?.getAttribute("vector-effect")).toBe(
      "a-value"
    );
  });
});

describe("strokeLineCapTransform", () => {
  it("should replace any stroke-linecap attribute on all elements", () => {
    const output = transform(
      strokeLineCapTransform,
      '<svg stroke-linecap="hi"><path stroke-linecap="hi" /><line stroke-linecap="hi" /><polygon stroke-linecap="hi" /><polyline stroke-linecap="hi" /><ellipse stroke-linecap="hi" /><rect stroke-linecap="hi" /><circle stroke-linecap="hi" /></svg>'
    );
    expect(output.getAttribute("stroke-linecap")).toBe("round");
    expect(output.querySelector("path")?.getAttribute("stroke-linecap")).toBe(
      "round"
    );
    expect(output.querySelector("line")?.getAttribute("stroke-linecap")).toBe(
      "round"
    );
    expect(
      output.querySelector("polygon")?.getAttribute("stroke-linecap")
    ).toBe("round");
    expect(
      output.querySelector("polyline")?.getAttribute("stroke-linecap")
    ).toBe("round");
    expect(
      output.querySelector("ellipse")?.getAttribute("stroke-linecap")
    ).toBe("round");
    expect(output.querySelector("rect")?.getAttribute("stroke-linecap")).toBe(
      "round"
    );
    expect(output.querySelector("circle")?.getAttribute("stroke-linecap")).toBe(
      "round"
    );
  });

  it("should use the custom config value when replacing", () => {
    const output = transform(
      strokeLineCapTransform,
      '<svg stroke-linecap="hi"></svg>',
      { strokeLinecap: "butt" }
    );
    expect(output.getAttribute("stroke-linecap")).toBe("butt");
  });

  it("should not change the value of the stroke-linecap attribute when already set as the default", () => {
    const output = transform(
      strokeLineCapTransform,
      `<svg stroke-linecap="${initialConfig.strokeLinecap}"></svg>`
    );
    expect(output.getAttribute("stroke-linecap")).toBe(
      initialConfig.strokeLinecap
    );
  });
});

describe("strokeLineJoinTransform", () => {
  it("should replace any stroke-linejoin attribute on all elements", () => {
    const output = transform(
      strokeLineJoinTransform,
      '<svg stroke-linejoin="hi"><path stroke-linejoin="hi" /><line stroke-linejoin="hi" /><polygon stroke-linejoin="hi" /><polyline stroke-linejoin="hi" /><ellipse stroke-linejoin="hi" /><rect stroke-linejoin="hi" /><circle stroke-linejoin="hi" /></svg>'
    );
    expect(output.getAttribute("stroke-linejoin")).toBe("round");
    expect(output.querySelector("path")?.getAttribute("stroke-linejoin")).toBe(
      "round"
    );
    expect(output.querySelector("line")?.getAttribute("stroke-linejoin")).toBe(
      "round"
    );
    expect(
      output.querySelector("polygon")?.getAttribute("stroke-linejoin")
    ).toBe("round");
    expect(
      output.querySelector("polyline")?.getAttribute("stroke-linejoin")
    ).toBe("round");
    expect(
      output.querySelector("ellipse")?.getAttribute("stroke-linejoin")
    ).toBe("round");
    expect(output.querySelector("rect")?.getAttribute("stroke-linejoin")).toBe(
      "round"
    );
    expect(
      output.querySelector("circle")?.getAttribute("stroke-linejoin")
    ).toBe("round");
  });

  it("should use the custom config value when replacing", () => {
    const output = transform(
      strokeLineJoinTransform,
      '<svg stroke-linejoin="hi"></svg>',
      { strokeLinejoin: "miter" }
    );
    expect(output.getAttribute("stroke-linejoin")).toBe("miter");
  });

  it("should not change the value of the stroke-linejoin attribute when already set as the default", () => {
    const output = transform(
      strokeLineJoinTransform,
      `<svg stroke-linejoin="${initialConfig.strokeLinejoin}"></svg>`
    );
    expect(output.getAttribute("stroke-linejoin")).toBe(
      initialConfig.strokeLinejoin
    );
  });
});

describe("strokeColorTransform", () => {
  it("should change the stroke color", () => {
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="green" /></svg>',
      { stroke: "blue" }
    );
    expect(output.querySelector("path")?.getAttribute("stroke")).toBe("blue");
  });

  it("should not change the stroke color when already set to the default", () => {
    const output = transform(
      strokeColorTransform,
      `<svg><path stroke="${initialConfig.stroke}" /></svg>`
    );
    expect(output.querySelector("path")?.getAttribute("stroke")).toBe(
      initialConfig.stroke
    );
  });

  it("should not add a stroke color when not already set", () => {
    const output = transform(svgAttributesTransform, "<svg><path /></svg>");
    expect(output.querySelector("path")?.getAttribute("stroke")).toBe(null);
  });

  it("should avoid updates if there are elements with different stroke values", () => {
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="blue" /><path stroke="red" /></svg>'
    );
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path stroke="blue"></path><path stroke="red"></path></svg>"`
    );
  });

  it('should make updates if there are elements with different stroke values but they fall under "currentColor, inherit, initial, transparent, unset, 0"', () => {
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="currentColor" /><path stroke="inherit" /><path stroke="initial" /><path stroke="transparent" /><path stroke="unset" /><path stroke="0" /><path stroke="blue"></svg>'
    );
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path></svg>"`
    );
  });
});

describe("fillColorTransform", () => {
  it("should change the fill color", () => {
    const output = transform(
      fillColorTransform,
      '<svg><path fill="green" /></svg>',
      { fill: "blue" }
    );
    expect(output.querySelector("path")?.getAttribute("fill")).toBe("blue");
  });

  it("should not change the fill color when already set to the default", () => {
    const output = transform(
      fillColorTransform,
      `<svg><path fill="${initialConfig.fill}" /></svg>`
    );
    expect(output.querySelector("path")?.getAttribute("fill")).toBe(
      initialConfig.fill
    );
  });

  it("should not add a fill color when not already set", () => {
    const output = transform(svgAttributesTransform, "<svg><path /></svg>");
    expect(output.querySelector("path")?.getAttribute("fill")).toBe(null);
  });

  it("should avoid updates if there are elements with different fill values", () => {
    const output = transform(
      fillColorTransform,
      '<svg><path fill="blue" /><path fill="red" /></svg>'
    );
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path fill="blue"></path><path fill="red"></path></svg>"`
    );
  });

  it('should make updates if there are elements with different fill values but they fall under "currentColor, inherit, initial, transparent, unset, 0"', () => {
    const output = transform(
      fillColorTransform,
      '<svg><path fill="currentColor" /><path fill="inherit" /><path fill="initial" /><path fill="transparent" /><path fill="unset" /><path fill="0" /><path fill="blue"></svg>'
    );
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path fill="currentColor"></path><path fill="inherit"></path><path fill="initial"></path><path fill="transparent"></path><path fill="unset"></path><path fill="0"></path><path fill="currentColor"></path></svg>"`
    );
  });
});
