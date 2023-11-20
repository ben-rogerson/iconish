import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { tw } from "@/lib/utils";
import { useMemo } from "react";
import validateColor from "validate-color";

// const saveTemplateAsFile = (
//   filename: string,
//   dataObjToWrite: Record<string, unknown>
// ) => {
//   const json = JSON.stringify(dataObjToWrite);
//   const blob = new Blob([json], { type: "text/json" });
//   const link = document.createElement("a");

//   link.download = filename;
//   link.href = window.URL.createObjectURL(blob);
//   link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

//   const evt = new MouseEvent("click", {
//     view: window,
//     bubbles: true,
//     cancelable: true,
//   });

//   link.dispatchEvent(evt);
//   link.remove();

//   return json;
// };

type ConfigRange = {
  title: string;
  defaultValue: string;
  type: "range";
  onChange: (value: number[]) => void;
};

type ConfigInput = {
  title: string;
  defaultValue: string;
  type: "text";
  theme?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
};

type ConfigSelect = {
  title: string;
  defaultValue: string;
  options: string[];
  onChange: (val: string) => void;
};

type ConfigType = ConfigRange | ConfigInput | ConfigSelect;

const isRange = (item: ConfigType): item is ConfigRange =>
  "type" in item && item.type === "range";

const isInput = (item: ConfigType): item is ConfigInput =>
  "type" in item && item.type === "text";

const isSelect = (item: ConfigType): item is ConfigSelect => !("type" in item);

export const ConfigPanel = () => {
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const { getConfig, setConfig } = useAppActions();
  const config = getConfig();

  const configItems = useMemo(
    () => [
      {
        title: "stroke width",
        defaultValue: config.strokeWidth,
        type: "range",
        onChange: (val: number[]) => {
          setConfig({ strokeWidth: String(val[0]) });
        },
      } satisfies ConfigRange,
      {
        title: "stroke color",
        defaultValue: config.stroke,
        type: "text",
        theme: config.stroke,
        onChange: (e) => {
          const stroke =
            e.target.value && validateColor(e.target.value)
              ? e.target.value
              : null;
          if (!stroke) return;
          setConfig({ stroke });
        },
        onBlur: (e) => {
          if (validateColor(e.target.value)) return;
          e.target.value = config.stroke;
        },
      } satisfies ConfigInput,
      {
        title: "fill color",
        defaultValue: config.fill,
        type: "text",
        theme: config.fill,
        onChange: (e) => {
          const fill =
            e.target.value && validateColor(e.target.value)
              ? e.target.value
              : null;
          if (!fill) return;
          setConfig({ fill });
        },
        onBlur: (e) => {
          if (validateColor(e.target.value)) return;
          e.target.value = config.fill;
        },
      } satisfies ConfigInput,
      {
        title: "stroke-linecap",
        defaultValue: config.strokeLinecap,
        options: ["butt", "round", "square"],
        onChange: (strokeLinecap) => {
          setConfig({ strokeLinecap });
        },
      } satisfies ConfigSelect,
      {
        title: "stroke-linejoin",
        defaultValue: config.strokeLinejoin,
        options: ["arcs", "bevel", "miter", "miter-clip", "round"],
        onChange: (strokeLinejoin) => {
          setConfig({ strokeLinejoin });
        },
      } satisfies ConfigSelect,
    ],
    [setConfig, config]
  );

  // const handleSaveConfig = () => {
  //   let theDate = new Date();
  //   theDate.toISOString().split("T")[0];

  //   const offset = theDate.getTimezoneOffset();
  //   theDate = new Date(theDate.getTime() - offset * 60 * 1000);

  //   const filename = `${
  //     theDate.toISOString().split("T")[0]
  //   }-iconish-config.json`;

  //   saveTemplateAsFile(filename, { config });

  //   toast({ title: "Config saved", description: `${filename}` });
  // };

  // const handleLoadConfig = () => {
  //   // Open file dialog
  //   // Read file
  //   // Set config
  //   console.log("TODO: handleLoadConfig");
  // };

  return (
    <div
      className="group/config flex w-full grid-cols-4 items-center gap-10"
      key={`group-${activeGroupId}`}
    >
      {configItems.map((item, i) => (
        <label className="grid" key={i}>
          <div className="">{item.title}</div>
          <div className="flex gap-2 text-[--text-muted]">
            {(isRange(item) && (
              <div className="absolute relative -mb-2 -mt-1 flex w-44 items-center gap-2">
                <Slider
                  defaultValue={[Number(item.defaultValue)]}
                  max={5}
                  min={1}
                  step={1}
                  onValueChange={item.onChange}
                />
                {item.type === "range" && `${item.defaultValue}`}
              </div>
            )) ||
              (isInput(item) && (
                <div className={tw`flex items-center gap-x-1.5`}>
                  {item.theme && (
                    <div
                      className={tw`h-3 w-3 rounded-sm`}
                      style={{ backgroundColor: `${item.theme}` }}
                    />
                  )}
                  <input
                    type="text"
                    defaultValue={item.defaultValue}
                    onChange={item.onChange}
                    onBlur={item.onBlur}
                    spellCheck={false}
                    className="border-b border-b-transparent bg-transparent text-[--text-muted] focus:border-b-[--line-border] focus:text-[--text-normal] focus:text-[--text] focus:outline-none"
                  />
                </div>
              )) ||
              (isSelect(item) && (
                <div className="flex items-center gap-x-1.5">
                  <Select
                    onValueChange={item.onChange}
                    defaultValue={item.defaultValue}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {item.options?.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
          </div>
        </label>
      ))}
      {/* Config:
      <button type="button" onClick={handleLoadConfig}>
        Load
      </button>
      <button type="button" onClick={handleSaveConfig}>
        Save
      </button> */}
    </div>
  );
};
