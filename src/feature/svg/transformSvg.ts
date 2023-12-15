import { parseSvg } from "@/feature/svg/parseSvg";
import { transforms } from "@/feature/svg/transforms";
import { optimizeAll } from "./svgTasks";
import { type Config } from "@/feature/config/types";

export const transformSvg = (svg: string, title: string, config: Config) => {
  const doc = transforms.reduce((a, t) => t(a, config), parseSvg(svg));

  const svgDoc = doc.querySelector("svg");

  let id = svgDoc?.getAttribute("id");

  // When no id on the svg is found, use the title
  if (svgDoc && title) {
    svgDoc.setAttribute("id", title.toLowerCase().trim().replaceAll(" ", "-"));
    id = title;
  }

  const output = optimizeAll((svgDoc ?? doc).toString());

  return { output, id };
};
