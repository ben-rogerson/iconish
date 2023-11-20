import { optimize } from "svgo";
import { sanitizeTransforms } from "@/feature/svg/transforms";
import { transformSvg } from "@/feature/svg/transformSvg";
import { parseSvg } from "@/feature/svg/parseSvg";
import { Config } from "@/feature/config/types";

export const optimizeAll = (svg: string) => {
  try {
    const result = optimize(svg, {
      multipass: true,
      plugins: [
        { name: "preset-default" },
        {
          name: "removeAttributesBySelector",
          params: {
            selector: "svg",
            attributes: ["xml:space", "width", "height"],
          },
        },
        { name: "sortAttrs", params: { xmlnsOrder: "alphabetical" } },
        { name: "removeAttrs", params: { attrs: ["data-*", "data.*"] } },
        { name: "removeDimensions" }, // ??
        { name: "convertStyleToAttrs", params: { keepImportant: true } },
      ],
    });
    return result.data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(msg);
  }
};

export const doTransformSvg =
  (config: Config) =>
  (title = "", svg = "", originalSvg = "") => ({
    ...transformSvg(svg, title, config),
    original: originalSvg,
  });

export const doSanitizeSvg = (svgInput: string) => {
  const transformedDoc = sanitizeTransforms.reduce(
    (a, t) => t(a),
    parseSvg(svgInput)
  );

  const output = transformedDoc.toString();
  return output;
};
