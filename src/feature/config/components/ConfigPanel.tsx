import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectMainLabel,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { tw } from "@/lib/utils";
import { run } from "@/utils/run";
import type { MutableRefObject } from "react";
import { Fragment, useMemo, useRef } from "react";
import validateColor from "validate-color";
import debounce from "lodash/debounce";
import type { DebouncedFunc } from "lodash";

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
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
};

type ConfigSelect = {
  title: string;
  defaultValue: string;
  options: string[];
  onChange: (val: string) => void;
};

type ConfigCheckbox = {
  title: string;
  defaultChecked: boolean;
  type: "checkbox";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type ConfigType = ConfigRange | ConfigInput | ConfigSelect | ConfigCheckbox;

const isRange = (item: ConfigType): item is ConfigRange =>
  "type" in item && item.type === "range";

const isInput = (item: ConfigType): item is ConfigInput =>
  "type" in item && item.type === "text";

const isSelect = (item: ConfigType): item is ConfigSelect => !("type" in item);

const isCheckbox = (item: ConfigType): item is ConfigCheckbox =>
  "type" in item && item.type === "checkbox";

// Debounce for config items that update their values often (eg: a draggable slider)
const debouncer = (
  fn: () => void,
  ref: MutableRefObject<DebouncedFunc<() => void> | undefined>
) => {
  ref.current?.cancel();
  ref.current = debounce(fn, 200, { trailing: true });
  ref.current();
};

export const ConfigPanel = () => {
  const activeGroupId = useAppStore((s) => s.activeGroupId);
  const { getConfig, setConfig } = useAppActions();
  const debounceRef = useRef<DebouncedFunc<() => void>>();

  const config = getConfig();

  const configItems = useMemo(
    () => [
      {
        title: "stroke width",
        defaultValue: config.strokeWidth,
        type: "range",
        onChange: (val: number[]) => {
          debouncer(() => {
            setConfig({ strokeWidth: String(val[0]) });
          }, debounceRef);
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

          // Allow the number to be finished, then update the config
          setTimeout(() => {
            setConfig({ stroke });
          }, 0);
        },
        onBlur: (e) => {
          if (validateColor(e.target.value)) return;
          e.target.value = config.stroke;
        },
        onClick: () => {
          console.log("TODO: open color picker");
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

          // Allow the number to be finished, then update the config
          setTimeout(() => {
            setConfig({ fill });
          }, 0);
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
      {
        title: "non-scaling-stroke",
        defaultChecked: config.nonScalingStroke,
        type: "checkbox",
        onChange: (e) => {
          setConfig({ nonScalingStroke: Boolean(e.target.value) });
        },
      } satisfies ConfigCheckbox,
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
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          {run(() => {
            if (isRange(item))
              return (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                <div data-testid={`range-${i}`}>
                  {/* Can't be accessible label - id not supported with Slider */}
                  <div id={`range-${i}-title`}>{item.title}</div>
                  <div className="flex gap-2 text-[--text-muted]">
                    <div className="relative -mb-2 -mt-1 flex w-44 items-center gap-2">
                      <Slider
                        defaultValue={[Number(item.defaultValue)]}
                        max={5}
                        min={1}
                        step={1}
                        aria-labelledby={`range-${i}-title`}
                        onValueChange={item.onChange}
                        id={`range-${i}`}
                      />
                      {item.defaultValue}
                    </div>
                  </div>
                </div>
              );

            if (isInput(item))
              return (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                <div data-testid={`input-${i}`}>
                  <label htmlFor={`input-${i}`}>{item.title}</label>
                  <div className="flex gap-2 text-[--text-muted]">
                    <div className={tw`flex items-center gap-x-1.5`}>
                      {!!item.theme && (
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
                        className="border-b border-b-transparent bg-transparent text-[--text-muted] focus:border-b-[--line-border] focus:text-[--text] focus:outline-none w-full"
                        id={`input-${i}`}
                      />
                    </div>
                  </div>
                </div>
              );

            if (isSelect(item))
              return (
                <div data-testid={`select-${i}`}>
                  <SelectMainLabel htmlFor={`select-${i}`}>
                    {item.title}
                  </SelectMainLabel>
                  <div className="flex gap-2 text-[--text-muted]">
                    <div className="flex items-center gap-x-1.5">
                      <Select
                        onValueChange={item.onChange}
                        defaultValue={item.defaultValue}
                      >
                        <SelectTrigger className="w-[180px]" id={`select-${i}`}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );

            if (isCheckbox(item))
              return (
                <>
                  <label htmlFor={`checkbox-${i}`}>{item.title}</label>
                  <input
                    type={item.type}
                    defaultChecked={item.defaultValue}
                    onChange={item.onChange}
                    onBlur={item.onBlur}
                  />
                </>
              );
          })}
        </Fragment>
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
