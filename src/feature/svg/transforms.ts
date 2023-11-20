import { type Config } from "@/feature/config/types";
import { type HTMLElement } from "node-html-parser";

// const viewBoxTransform = (doc: HTMLElement) => {
//   const svg = doc.querySelector("svg");
//   if (!svg) return doc;
//   if (svg.hasAttribute("viewBox")) return doc;
//   svg.setAttribute("viewBox", "0 0 24 24"); // TODO: Make customizable
//   return doc;
// };

const ELEMENT_COMMON_IGNORE_VALUES = [
  "none",
  "currentColor",
  "inherit",
  "initial",
  "transparent",
  "unset",
  "0",
];

const fillColorTransform = (doc: HTMLElement, config: Config) => {
  const paths = doc.querySelectorAll(
    "path[fill], line[fill], polygon[fill], polyline[fill], ellipse[fill], rect[fill], circle[fill]"
  );

  const targetPaths = [...paths]
    .map((path) => {
      const value = path.getAttribute("fill");

      if (ELEMENT_COMMON_IGNORE_VALUES.includes(value!)) return null;
      return path;
    })
    .filter(Boolean);

  // Check for a colored svg to avoid applying fill
  if (targetPaths.length > 1) {
    console.warn(`Multiple fill colors found, avoiding fill change.`);
    return doc;
  }

  for (const path of targetPaths) {
    // const value = path.getAttribute("fill") as string;

    // if (ELEMENT_COMMON_IGNORE_VALUES.includes(value)) continue;

    // if (value === "" || value === "0") {
    //   path.removeAttribute("stroke");
    //   continue;
    // }

    // if (value !== fillColorConfig)
    //   console.warn(
    //     `Inconsistent fill. Found: ${value}, Updated to ${fillColorConfig}`
    //   );

    path?.setAttribute("fill", config.fill);
  }

  return doc;
};

const vectorEffectTransform = (doc: HTMLElement) => {
  const svg = doc.querySelector("svg");
  const hasSvgStroke =
    svg?.getAttribute("stroke") ??
    svg?.getAttribute("stroke-width") ??
    svg?.getAttribute("strokeWidth");

  const paths = doc.querySelectorAll(
    "path, line, polygon, polyline, ellipse, rect, circle"
  );
  paths.forEach((path) => {
    if (
      path.hasAttribute("vector-effect") ||
      path.hasAttribute("vectorEffect") ||
      (!hasSvgStroke && !path.hasAttribute("stroke"))
    )
      return;
    path.setAttribute("vector-effect", "non-scaling-stroke");
  });
  return doc;
};

const strokeLineCapTransform = (doc: HTMLElement, config: Config) => {
  const paths = doc.querySelectorAll("*[stroke-linecap]");
  const strokeLineCapConfig = config.strokeLinecap;
  paths.forEach((path) => {
    if (path.getAttribute("stroke-linecap") === strokeLineCapConfig) return;
    path.setAttribute("stroke-linecap", strokeLineCapConfig);
  });
  return doc;
};

const strokeLineJoinTransform = (doc: HTMLElement, config: Config) => {
  const paths = doc.querySelectorAll("*[stroke-linejoin]");
  const strokeLineJoinConfig = config.strokeLinejoin;
  paths.forEach((path) => {
    if (path.getAttribute("stroke-linejoin") === strokeLineJoinConfig) return;
    path.setAttribute("stroke-linejoin", strokeLineJoinConfig);
  });
  return doc;
};

const strokeWidthTransform = (doc: HTMLElement, config: Config) => {
  const paths = doc.querySelectorAll(
    "svg[strokeWidth], path[strokeWidth], line[strokeWidth], polygon[strokeWidth], polyline[strokeWidth], ellipse[strokeWidth], rect[strokeWidth], circle[strokeWidth], svg[stroke-width], path[stroke-width], line[stroke-width], polygon[stroke-width], polyline[stroke-width], ellipse[stroke-width], rect[stroke-width], circle[stroke-width]"
  );

  const strokeWidthConfig = config.strokeWidth;

  paths.forEach((path) => {
    // let value = null;
    // // Use strokeWidth attribute if happens to be set
    // if (path.hasAttribute("strokeWidth")) {
    //   value = path.getAttribute("strokeWidth");
    // }
    // const value =
    //   path.getAttribute("strokeWidth") ?? path.getAttribute("stroke-width");

    path.removeAttribute("strokeWidth");

    // if (value && value !== strokeWidthConfig)
    //   console.warn(
    //     `Inconsistent stroke width. Found: ${path.getAttribute(
    //       "stroke-width"
    //     )}, Updated: ${strokeWidthConfig}`
    //   );

    path.setAttribute("stroke-width", strokeWidthConfig);
  });
  return doc;
};

const svgAttributesTransform = (doc: HTMLElement, config: Config) => {
  const svg = doc.querySelector("svg");
  if (!svg) return doc;

  if (!svg.hasAttribute("viewBox")) {
    const width = svg.getAttribute("width");
    const height = svg.getAttribute("height");

    if (
      width &&
      height &&
      Number.isInteger(Number(width)) &&
      Number.isInteger(Number(height))
    ) {
      // console.warn(
      //   `ViewBox not found on the svg element. Adding from width and height.`
      // );
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
    // else {
    // if (!width || !height) {
    //   console.warn(`ViewBox not found on the svg element.`);
    // }
    // }
  }

  if (svg.getAttribute("width")) {
    // console.warn(
    //   `Width found on the svg element. Found: ${svg.getAttribute(
    //     "width"
    //   )}, Removed width attribute`
    // );
    svg.removeAttribute("width");
  }

  if (svg.hasAttribute("height")) {
    // console.warn(
    //   `Height found on the svg element. Found: ${svg.getAttribute(
    //     "height"
    //   )}, Removed height attribute`
    // );
    svg.removeAttribute("height");
  }

  if (svg.hasAttribute("fill")) {
    const value = svg.getAttribute("fill");
    if (value !== "none") {
      // console.warn(
      //   `Fill found on the svg element. Found: ${value}, Removed fill attribute. Set it to 'none' to keep it.`
      // );
      svg.removeAttribute("fill");
    }
  }

  if (svg.hasAttribute("stroke")) {
    const strokeConfig = config.stroke;
    const value = svg.getAttribute("stroke")!;

    if (value.length > 0 && value !== strokeConfig) {
      // console.warn(
      //   `Stroke found on the svg element. Found: ${value}, Updated to ${strokeConfig}`
      // );
      svg.setAttribute("stroke", strokeConfig);
    }
  }

  return doc;
};

const svgAttributesSanitizeTransform = (doc: HTMLElement) => {
  const svg = doc.querySelector("svg");
  if (!svg) return doc;

  if (svg.getAttribute("width")) {
    // console.warn(
    //   `Width found on the svg element. Found: ${svg.getAttribute(
    //     "width"
    //   )}, Removed width attribute`
    // );
    svg.removeAttribute("width");
  }

  if (svg.hasAttribute("height")) {
    // console.warn(
    //   `Height found on the svg element. Found: ${svg.getAttribute(
    //     "height"
    //   )}, Removed height attribute`
    // );
    svg.removeAttribute("height");
  }

  return doc;
};

export const addId = (doc: HTMLElement, title: string) => {
  const svg = doc.querySelector("svg");
  if (!svg) return doc;
  if (!title) return doc;

  svg.setAttribute("id", title);

  return doc;

  // console.log({ id: svg.getAttribute("id") });
  // if (svg.hasAttribute("id")) return doc;
  // const ID = Math.random().toString(36).slice(2);
  // console.warn(`No ID found on the svg element - generating a new one: ${ID}`);
  // svg.setAttribute("id", ID);
  // return doc;
};

const strokeColorTransform = (doc: HTMLElement, config: Config) => {
  const paths = doc.querySelectorAll(
    "path[stroke], line[stroke], polygon[stroke], polyline[stroke], ellipse[stroke], rect[stroke], circle[stroke]"
  );
  const strokeColorConfig = config.stroke;

  // Check for a colored svg to avoid applying stroke color
  const valueSet = new Set();
  for (const path of paths) {
    if (!path.hasAttribute("stroke")) continue;

    const value = path.getAttribute("stroke")!;
    if (ELEMENT_COMMON_IGNORE_VALUES.includes(value)) continue;
    valueSet.add(value);
  }
  if (valueSet.size > 1) {
    // console.warn(
    //   `Multiple stroke colors found, avoiding applying stroke color.`
    // );
    return doc;
  }

  for (const path of paths) {
    if (!path.hasAttribute("stroke")) continue;

    const value = path.getAttribute("stroke")!;

    // if (value === "" || value === "0") {
    //   path.removeAttribute("stroke");
    //   continue;
    // }

    // if (ELEMENT_COMMON_IGNORE_VALUES.includes(value)) continue;

    if (value !== strokeColorConfig)
      // console.warn(
      //   `Inconsistent stroke color. Found: ${path.getAttribute(
      //     "stroke"
      //   )}, Updated: ${strokeColorConfig}`
      // );

      path.setAttribute("stroke", strokeColorConfig);
  }

  return doc;
};

export const transforms: Array<
  (doc: HTMLElement, config: Config) => HTMLElement
> = [
  svgAttributesTransform,
  // viewBoxTransform,
  strokeWidthTransform,
  vectorEffectTransform,
  strokeLineCapTransform,
  strokeLineJoinTransform,
  strokeColorTransform,
  fillColorTransform,
];

export const sanitizeTransforms: Array<(doc: HTMLElement) => HTMLElement> = [
  svgAttributesSanitizeTransform,
];
