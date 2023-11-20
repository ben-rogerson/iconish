import { parseSvg } from "@/feature/svg/parseSvg";
import { transforms } from "@/feature/svg/transforms";
import { optimizeAll } from "./svgTasks";
import { type Config } from "@/feature/config/types";
// import { hashCode } from "@/utils/hash";

export const transformSvg = (svg: string, title: string, config: Config) => {
  const doc = transforms.reduce((a, t) => t(a, config), parseSvg(svg));

  // const doc = addId(transformedSvgDocument, title);
  const svgDoc = doc.querySelector("svg");
  const id = svgDoc?.getAttribute("id") ?? undefined;
  if (svgDoc && title && id) svgDoc.setAttribute("id", title);

  const svgCode = doc.toString();

  // const symbolReference = `<svg><use xlink:href="#${
  //   doc.documentElement.getAttribute("id") ?? ""
  // }"></use></svg>`;
  // (async () => {
  //   const prettified = await prettier.format(result.data, {
  //     parser: "flow",
  //     // plugins: [parserEspree],
  //   });
  //   console.log({ prettified });
  // })();
  const output = optimizeAll(svgCode) ?? "";

  // const symbol = `${outerHTML
  //   .replace(/<svg /, "<symbol ")
  //   .replace(/<\/svg>/, "</symbol>")}`;
  return { output, id };
};
