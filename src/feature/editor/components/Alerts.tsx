import { parseSvg } from "@/feature/svg/parseSvg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const warningIcon = (
  <svg
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    className="h-[1em] w-[1em] text-xl"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke" />
    <path d="M12 8v4m0 4h.01" vectorEffect="non-scaling-stroke" />
  </svg>
);

const alerts = new Map([
  [
    "Potential SVG Fill Issue",
    {
      desc: "The svg contains a fill attribute which means the graphic isn’t a line-based icon. This means it cannot take advantage of the stroke width setting and resizing the svg can cause irregular thicknesses making it look like it’s not part of an icon set.",
      fix: "Redraw the icon, using stroke for color rather than fill / Remove this warning by removing the fill from the svg element",
      test: (doc: Document) => {
        const value = doc.querySelector("svg")?.getAttribute("fill") ?? "";
        if (["none", "currentColor", "inherit", "initial", ""].includes(value))
          return false;

        return value.length > 0;
      },
    },
  ],
  [
    "No viewBox found",
    {
      desc: "...",
      fix: "Add a viewBox to the svg element",
      test: (doc: Document) =>
        (doc.querySelector("svg")?.getAttribute("viewBox") ?? "").length === 0,
    },
  ],
  [
    "Consistent fill color disabled",
    {
      desc: "Multiple colors were found in this SVG so a consistent fill color wasn't applied.",
      fix: "Remove additional colors from all the svg fills to allow the chosen fill color to be applied.",
      test: (doc: Document) => {
        const paths = doc.querySelectorAll(
          "path[fill], line[fill], polygon[fill], polyline[fill], ellipse[fill], rect[fill], circle[fill]"
        );
        const valueSet = new Set();
        for (const path of paths) {
          const value = path.getAttribute("fill");
          if (
            ["none", "currentColor", "inherit", "initial", ""].includes(value!)
          )
            continue;
          valueSet.add(value);
        }
        return valueSet.size > 1;
      },
    },
  ],
  [
    "Consistent stroke color disabled",
    {
      desc: "Multiple colors were found in this SVG so a consistent stroke color wasn't applied.",
      fix: "Remove additional colors from the svg stroke's to allow the chosen stroke color to be applied.",
      test: (doc: Document) => {
        const paths = doc.querySelectorAll(
          "path[stroke], line[stroke], polygon[stroke], polyline[stroke], ellipse[stroke], rect[stroke], circle[stroke]"
        );
        const valueSet = new Set();
        for (const path of paths) {
          const value = path.getAttribute("stroke");
          if (
            ["none", "currentColor", "inherit", "initial", ""].includes(value!)
          )
            continue;
          valueSet.add(value);
        }
        return valueSet.size > 1;
      },
    },
  ],
] satisfies [string, { desc: string; fix: string; test: (doc: Document) => boolean }][]);

export const parseSvgClient = (svg: string) =>
  new DOMParser().parseFromString(svg, "image/svg+xml");

export const Alerts = (props: { svg: string }) => {
  const svg = parseSvgClient(props.svg);

  const alertsList = [...alerts].map(([title, { desc, fix, test }]) => {
    if (!test(svg)) return null;

    return (
      <div className="flex gap-3.5" key={title}>
        <div className="text-2xl">{warningIcon}</div>
        <div className="grid gap-y-1">
          <h2 className="font-bold">{title}</h2>
          <div>{desc}</div>
          <div>Fix: {fix}</div>
        </div>
      </div>
    );
  });

  if (alertsList.filter(Boolean).length === 0) return null;

  return (
    <div className="absolute bottom-2 left-2">
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger className="block text-[--text]">
            {warningIcon}
          </TooltipTrigger>
          <TooltipContent className="grid w-[400px] items-start justify-between border-[--line-border] p-6 text-left text-base">
            <div className="">{alertsList}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
