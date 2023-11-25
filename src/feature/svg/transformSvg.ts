import { parseSvg } from "@/feature/svg/parseSvg";
import { transforms } from "@/feature/svg/transforms";
import { optimizeAll } from "./svgTasks";
import { type Config } from "@/feature/config/types";

export const transformSvg = (svg: string, title: string, config: Config) => {
  const doc = transforms.reduce((a, t) => t(a, config), parseSvg(svg));
  const svgDoc = doc.querySelector("svg");
  const id = svgDoc?.getAttribute("id") ?? undefined;
  if (svgDoc && title && id) svgDoc.setAttribute("id", title);

  const svgCode = doc.toString();

  const output = optimizeAll(svgCode);

  return { output, id };
};
