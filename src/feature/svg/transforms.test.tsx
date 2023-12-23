import { describe, it, expect, vi } from "vitest";
import { initialConfig } from "@/hooks/appState";
import {
  type Transform,
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
  fn: Transform,
  svg: string,
  config?: Partial<Record<keyof Config, string>>
) => {
  const doc = document.createElement("div") as unknown as HTMLElement;
  doc.innerHTML = svg;
  return (
    fn(doc, {
      config: config
        ? ({ ...initialConfig, ...config } as Config)
        : initialConfig,
      log: { add: vi.fn() },
    }).querySelector("svg") ?? doc
  );
};

describe("svgAttributesTransform", () => {
  it("should convert the width and height to a viewBox", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      svgAttributesTransform,
      '<svg width="50" height="25"></svg>'
    );
    expect(output.getAttribute("viewBox")).toBe("0 0 50 25");
  });

  it("should ignore adding a viewbox when a width or height is missing", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(svgAttributesTransform, "<svg height='20'></svg>");
    const output2 = transform(svgAttributesTransform, "<svg width='20'></svg>");

    expect(output.hasAttribute("width")).toBe(false);
    expect(output.hasAttribute("height")).toBe(false);
    expect(output.getAttribute("viewBox")).toBe("0 0 1 1");

    expect(output2.hasAttribute("width")).toBe(false);
    expect(output2.hasAttribute("height")).toBe(false);
    expect(output2.getAttribute("viewBox")).toBe("0 0 1 1");
  });

  it("should remove fill attribute when not none", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(svgAttributesTransform, '<svg fill="red"></svg>');
    expect(output.hasAttribute("fill")).toBe(false);
  });

  it("should not remove fill attribute when none", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(svgAttributesTransform, '<svg fill="none"></svg>');
    expect(output.getAttribute("fill")).toBe("none");
  });
});

describe("strokeWidthTransform", () => {
  it("should update the stroke-width on common svg element types", () => {
    // TODO: Add outputFilled / outputStroked tests for this
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
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg strokewidth="3"></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe(initialConfig.strokeWidth);
  });

  it("should update strokeWidth attribute", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg strokeWidth="3"></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe(initialConfig.strokeWidth);
  });

  it("should not change stroke-width attribute when already set as the default", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeWidthTransform,
      `<svg stroke-width="${initialConfig.strokeWidth}"></svg>`
    );
    expect(output.getAttribute("stroke-width")).toBe(initialConfig.strokeWidth);
  });

  it("should update stroke-width attribute when empty", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width=""></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe("2");
  });

  it("should not update stroke-width attribute when missing", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(strokeWidthTransform, "<svg></svg>");
    expect(output.getAttribute("stroke-width")).toBeNull();
  });

  it("should update the stroke-width attribute when invalid", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width="invalid"></svg>'
    );
    expect(output.getAttribute("stroke-width")).toBe("2");
  });
});

describe("vectorEffectTransform", () => {
  it("should add the vector-effect attribute to elements when missing", () => {
    // TODO: Add outputFilled / outputStroked tests for this
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
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      vectorEffectTransform,
      '<svg><path vector-effect="non-scaling-stroke" /></svg>'
    );
    expect(output.querySelector("path")?.getAttribute("vector-effect")).toBe(
      "non-scaling-stroke"
    );
  });

  it("should not change the value of the vector-effect attribute", () => {
    // TODO: Add outputFilled / outputStroked tests for this
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
    // TODO: Add outputFilled / outputStroked tests for this
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
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeLineCapTransform,
      '<svg stroke-linecap="hi"></svg>',
      { strokeLinecap: "butt" }
    );
    expect(output.getAttribute("stroke-linecap")).toBe("butt");
  });

  it("should not change the value of the stroke-linecap attribute when already set as the default", () => {
    // TODO: Add outputFilled / outputStroked tests for this
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
    // TODO: Add outputFilled / outputStroked tests for this
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
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeLineJoinTransform,
      '<svg stroke-linejoin="hi"></svg>',
      { strokeLinejoin: "miter" }
    );
    expect(output.getAttribute("stroke-linejoin")).toBe("miter");
  });

  it("should not change the value of the stroke-linejoin attribute when already set as the default", () => {
    // TODO: Add outputFilled / outputStroked tests for this
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
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="green" /></svg>',
      { stroke: "blue" }
    );
    expect(output.querySelector("path")?.getAttribute("stroke")).toBe("blue");
  });

  it("should not change the stroke color when already set to the default", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeColorTransform,
      `<svg><path stroke="${initialConfig.stroke}" /></svg>`
    );
    expect(output.querySelector("path")?.getAttribute("stroke")).toBe(
      initialConfig.stroke
    );
  });

  it("should not add a stroke color when not already set", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(svgAttributesTransform, "<svg><path /></svg>");
    expect(output.querySelector("path")?.getAttribute("stroke")).toBeNull();
  });

  it("should avoid updates if there are elements with different stroke values", () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="blue" /><path stroke="red" /></svg>'
    );
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path stroke="blue"></path><path stroke="red"></path></svg>"`
    );
  });

  it('should make updates if there are elements with different stroke values but they fall under "currentColor, inherit, initial, transparent, unset, 0"', () => {
    // TODO: Add outputFilled / outputStroked tests for this
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="currentColor" /><path stroke="inherit" /><path stroke="initial" /><path stroke="transparent" /><path stroke="unset" /><path stroke="0" /><path stroke="blue"></svg>'
    );
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path></svg>"`
    );
  });

  it("should update stroke attribute", () => {
    const outputFilled = transform(
      strokeColorTransform,
      '<svg stroke="red"><path stroke="red"/></svg>',
      { iconSetType: "filled" }
    );
    const outputStroked = transform(
      strokeColorTransform,
      '<svg stroke="red"><path stroke="red"/></svg>',
      { iconSetType: "stroked" }
    );

    expect(
      outputFilled.querySelector("svg")?.getAttribute("stroke")
    ).toBeUndefined();
    expect(
      outputStroked.querySelector("svg")?.getAttribute("stroke")
    ).toBeUndefined();

    expect(outputFilled.querySelector("path")?.getAttribute("stroke")).toBe(
      "red"
    );
    expect(outputStroked.querySelector("path")?.getAttribute("stroke")).toBe(
      "currentColor"
    );
  });

  it("should not update stroke attribute when already set to the initial value", () => {
    const outputFilled = transform(
      strokeColorTransform,
      '<svg stroke="currentColor"><path stroke="currentColor"/></svg>',
      { iconSetType: "filled" }
    );
    const outputStroked = transform(
      strokeColorTransform,
      '<svg stroke="currentColor"><path stroke="currentColor"/></svg>',
      { iconSetType: "stroked" }
    );

    expect(
      outputFilled.querySelector("svg")?.getAttribute("stroke")
    ).toBeUndefined();
    expect(
      outputStroked.querySelector("svg")?.getAttribute("stroke")
    ).toBeUndefined();

    expect(outputFilled.querySelector("path")?.getAttribute("stroke")).toBe(
      "currentColor"
    );
    expect(outputStroked.querySelector("path")?.getAttribute("stroke")).toBe(
      "currentColor"
    );
  });

  it("should not update stroke attribute when empty", () => {
    const outputFilled = transform(
      fillColorTransform,
      '<svg stroke=""><path stroke="" /></svg>',
      { iconSetType: "filled" }
    );
    const outputStroked = transform(
      fillColorTransform,
      '<svg stroke=""><path stroke="" /></svg>',
      { iconSetType: "stroked" }
    );

    expect(
      outputFilled.querySelector("svg")?.getAttribute("stroke")
    ).toBeUndefined();
    expect(
      outputStroked.querySelector("svg")?.getAttribute("stroke")
    ).toBeUndefined();

    expect(outputFilled.querySelector("path")?.getAttribute("stroke")).toBe("");
    expect(outputStroked.querySelector("path")?.getAttribute("stroke")).toBe(
      ""
    );
  });
});

describe("fillColorTransform", () => {
  it("should change the fill color", () => {
    const outputFilled = transform(
      fillColorTransform,
      '<svg fill="green"><path fill="green" /></svg>',
      { fill: "blue", iconSetType: "filled" }
    );
    const outputStroked = transform(
      fillColorTransform,
      '<svg fill="green"><path fill="green" /></svg>',
      { fill: "blue", iconSetType: "stroked" }
    );

    expect(
      outputFilled.querySelector("svg")?.getAttribute("fill")
    ).toBeUndefined();
    expect(
      outputStroked.querySelector("svg")?.getAttribute("fill")
    ).toBeUndefined();

    expect(outputFilled.querySelector("path")?.getAttribute("fill")).toBe(
      "blue"
    );
    expect(outputStroked.querySelector("path")?.getAttribute("fill")).toBe(
      "green"
    );
  });

  it("should not change the fill color when already set to the default", () => {
    const outputFilled = transform(
      fillColorTransform,
      `<svg fill="currentColor"><path fill="currentColor" /></svg>`,
      { iconSetType: "filled" }
    );
    const outputStroked = transform(
      fillColorTransform,
      `<svg fill="currentColor"><path fill="currentColor" /></svg>`,
      { iconSetType: "stroked" }
    );

    expect(
      outputFilled.querySelector("svg")?.getAttribute("fill")
    ).toBeUndefined();
    expect(
      outputStroked.querySelector("svg")?.getAttribute("fill")
    ).toBeUndefined();

    expect(outputFilled.querySelector("path")?.getAttribute("fill")).toBe(
      "currentColor"
    );
    expect(outputStroked.querySelector("path")?.getAttribute("fill")).toBe(
      "currentColor"
    );
  });

  it("should not add a fill color when not already set", () => {
    const outputFilled = transform(fillColorTransform, "<svg><path /></svg>", {
      iconSetType: "filled",
    });
    const outputStroked = transform(fillColorTransform, "<svg><path /></svg>", {
      iconSetType: "stroked",
    });

    expect(
      outputFilled.querySelector("svg")?.getAttribute("fill")
    ).toBeUndefined();
    expect(
      outputStroked.querySelector("svg")?.getAttribute("fill")
    ).toBeUndefined();

    expect(outputFilled.querySelector("path")?.getAttribute("fill")).toBeNull();
    expect(
      outputStroked.querySelector("path")?.getAttribute("fill")
    ).toBeNull();
  });

  it("should avoid updates if there are elements with different fill values", () => {
    const outputFilled = transform(
      fillColorTransform,
      '<svg fill="orange"><path fill="blue" /><path fill="red" /></svg>',
      { iconSetType: "filled" }
    );
    const outputStroked = transform(
      fillColorTransform,
      '<svg fill="orange"><path fill="blue" /><path fill="red" /></svg>',
      { iconSetType: "stroked" }
    );

    expect(outputFilled.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="orange"><path fill="blue"></path><path fill="red"></path></svg>"`
    );
    expect(outputStroked.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="orange"><path fill="blue"></path><path fill="red"></path></svg>"`
    );
  });

  it('should make updates if there are elements with different fill values but they fall under "currentColor, inherit, initial, transparent, unset, 0"', () => {
    const outputFilled = transform(
      fillColorTransform,
      '<svg fill="unset"><path fill="currentColor" /><path fill="inherit" /><path fill="initial" /><path fill="transparent" /><path fill="unset" /><path fill="0" /><path fill="blue"></svg>',
      { iconSetType: "filled" }
    );
    const outputStroked = transform(
      fillColorTransform,
      '<svg fill="unset"><path fill="currentColor" /><path fill="inherit" /><path fill="initial" /><path fill="transparent" /><path fill="unset" /><path fill="0" /><path fill="blue"></svg>',
      { iconSetType: "stroked" }
    );

    expect(outputFilled.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="unset"><path fill="currentColor"></path><path fill="currentColor"></path><path fill="currentColor"></path><path fill="currentColor"></path><path fill="currentColor"></path><path fill="currentColor"></path><path fill="currentColor"></path></svg>"`
    );
    expect(outputStroked.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="unset"><path fill="currentColor"></path><path fill="inherit"></path><path fill="initial"></path><path fill="transparent"></path><path fill="unset"></path><path fill="0"></path><path fill="blue"></path></svg>"`
    );
  });
});
