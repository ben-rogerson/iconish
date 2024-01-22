import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectMainLabel,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { cn, tw } from '@/lib/utils'
import { run } from '@/utils/run'
import type { MutableRefObject } from 'react'
import { Fragment, memo, useMemo, useRef, useState } from 'react'
import validateColor from 'validate-color'
import debounce from 'lodash/debounce'
import type { DebouncedFunc } from 'lodash'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { RotateCw } from 'lucide-react'

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

type FormRange = {
  id: string
  title: string
  defaultValue: string
  type: 'range'
  hidden?: boolean
  disabled: boolean
  onChange: (value: number[]) => void
}

type FormInput = {
  id: string
  title: string
  defaultValue: string
  type: 'text'
  theme?: string
  hidden?: boolean
  disabled: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void
}

type FormRadioGroup = {
  id: string
  title: string
  type: 'radio-group'
  defaultValue: string
  options: Array<[string, string]>
  hidden?: boolean
  disabled: boolean
  onChange: (val: string) => void
}

type FormSelect = {
  id: string
  title: string
  defaultValue: string
  options: string[]
  hidden?: boolean
  disabled: boolean
  onChange: (val: string) => void
}

type FormCheckbox = {
  id: string
  title: string
  defaultChecked: boolean
  type: 'checkbox'
  hidden?: boolean
  disabled: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

type FormItemType =
  | FormRange
  | FormInput
  | FormRadioGroup
  | FormSelect
  | FormCheckbox

const isColor = (value: string) => {
  // if (value.startsWith("--")) return true;
  // if (value.startsWith("var(--") && value.endsWith(")")) return true;
  return validateColor(value)
}

const isRadioGroup = (item: FormItemType): item is FormRadioGroup =>
  'type' in item && item.type === 'radio-group'

const isRange = (item: FormItemType): item is FormRange =>
  'type' in item && item.type === 'range'

const isInput = (item: FormItemType): item is FormInput =>
  'type' in item && item.type === 'text'

const isSelect = (item: FormItemType): item is FormSelect => !('type' in item)

const isCheckbox = (item: FormItemType): item is FormCheckbox =>
  'type' in item && item.type === 'checkbox'

// Debounce for config items that update their values often (eg: a draggable slider)
const debouncer = (
  fn: () => void,
  ref: MutableRefObject<DebouncedFunc<() => void> | null>
) => {
  ref.current?.cancel()
  ref.current = debounce(fn, 200, { trailing: true })
  ref.current()
}

const useMainItems = () => {
  const { getConfig, setConfig } = useAppActions()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const debounceRef = useRef<DebouncedFunc<() => void>>(null)
  const config = getConfig()

  const mainItems = useMemo(
    () => [
      {
        id: 'fill-color',
        title: 'fill',
        defaultValue: config.fill,
        type: 'text',
        theme: config.fill,
        hidden: config.iconSetType === 'outlined',
        disabled: config.iconSetType === 'outlined',
        onChange: e => {
          const fill =
            e.target.value &&
            (validateColor(e.target.value) ||
              (e.target.value.startsWith('var(--') &&
                e.target.value.endsWith(')')))
              ? e.target.value
              : null
          if (!fill) return

          // Allow the color to be added, then update the config
          setTimeout(() => {
            setConfig({ fill })
          }, 0)
        },
        onBlur: e => {
          const fill =
            e.target.value &&
            (validateColor(e.target.value) ||
              (e.target.value.startsWith('var(--') &&
                e.target.value.endsWith(')')))
              ? e.target.value
              : null
          if (!fill) {
            // Reset to previous value
            e.target.value = config.fill
            return
          }

          // Allow the color to be added, then update the config
          setTimeout(() => {
            e.target.value = config.fill
          }, 0)
        },
      } satisfies FormInput,
      {
        id: 'stroke-width',
        title: 'stroke width',
        defaultValue: config.strokeWidth,
        type: 'range',
        disabled: config.iconSetType === 'solid',
        hidden: config.iconSetType === 'solid',
        onChange: (val: number[]) => {
          debouncer(() => {
            setConfig({ strokeWidth: String(val[0]) })
          }, debounceRef)
        },
      } satisfies FormRange,
      {
        id: 'stroke-color',
        title: 'stroke color',
        defaultValue: config.stroke,
        type: 'text',
        theme: config.stroke,
        hidden: config.iconSetType === 'solid',
        disabled: config.iconSetType === 'solid',
        onChange: e => {
          const stroke =
            e.target.value && isColor(e.target.value) ? e.target.value : null
          if (!stroke) return

          // Allow the color to be added, then update the config
          setTimeout(() => {
            setConfig({ stroke })
          }, 0)
        },
        onBlur: e => {
          if (isColor(e.target.value)) return
          e.target.value = config.stroke
        },
      } satisfies FormInput,

      {
        id: 'stroke-linecap',
        title: 'linecap',
        defaultValue: config.strokeLinecap,
        disabled: false,
        options: ['butt', 'round', 'square'],
        onChange: strokeLinecap => {
          setConfig({ strokeLinecap })
        },
      } satisfies FormSelect,
      {
        id: 'stroke-linejoin',
        title: 'linejoin',
        defaultValue: config.strokeLinejoin,
        disabled: false,
        options: ['arcs', 'bevel', 'miter', 'miter-clip', 'round'],
        onChange: strokeLinejoin => {
          setConfig({ strokeLinejoin })
        },
      } satisfies FormSelect,
      {
        id: 'non-scaling-stroke',
        title: 'non-scaling stroke',
        defaultChecked: config.nonScalingStroke,
        disabled: config.iconSetType === 'solid',
        hidden: config.iconSetType === 'solid',
        type: 'checkbox',
        onChange: e => {
          setConfig({ nonScalingStroke: e.target.checked })
        },
      } satisfies FormCheckbox,
    ],
    [setConfig, config]
  )

  return mainItems
}

export const FormItems = memo(function FormItems(props: {
  items: FormItemType[]
}) {
  return props.items.map((item, i) => (
    <Fragment key={item.id}>
      {run(() => {
        if (isRadioGroup(item))
          return (
            <RadioGroup
              data-testid={`control-${item.id}`}
              defaultValue={item.defaultValue}
              onValueChange={item.onChange}
            >
              {item.options.map(([value, text]) => (
                <div className="flex items-center space-x-2" key={value}>
                  <RadioGroupItem value={value} id={value} />
                  <Label htmlFor={value}>{text}</Label>
                </div>
              ))}
            </RadioGroup>
          )

        if (isRange(item))
          return (
            <div
              data-testid={`control-${item.id}`}
              className={cn('grid gap-2', {
                'opacity-25': item.disabled,
                hidden: item.hidden,
              })}
            >
              {/* Can't have clickable label - htmlFor not supported with Slider */}
              <div id={`range-${i}-title`}>{item.title}</div>
              <div className="flex gap-2 text-[--text-muted]">
                <div className="relative -mb-2 -mt-1 flex w-44 items-center gap-1.5">
                  <Slider
                    defaultValue={[Number(item.defaultValue)]}
                    max={5}
                    min={1}
                    step={0.5}
                    aria-labelledby={`range-${i}-title`}
                    onValueChange={item.onChange}
                    id={`range-${i}`}
                    disabled={item.disabled}
                  />
                  <div className="min-w-[3ch]">{item.defaultValue}</div>
                </div>
              </div>
            </div>
          )

        if (isInput(item))
          return (
            <div
              data-testid={`control-${item.id}`}
              className={cn('grid gap-1.5', {
                'opacity-25': item.disabled,
                hidden: item.hidden,
              })}
            >
              <label htmlFor={`input-${i}`}>{item.title}</label>
              <div className="flex gap-2 text-[--text-muted]">
                <div className={tw`flex w-full items-center gap-x-1.5`}>
                  {!!item.theme && (
                    <div
                      className={tw`h-3 w-3 rounded-sm`}
                      style={{ backgroundColor: item.theme }}
                    />
                  )}
                  <input
                    type="text"
                    defaultValue={item.defaultValue}
                    onChange={item.onChange}
                    onBlur={item.onBlur}
                    disabled={item.disabled}
                    spellCheck={false}
                    className="w-full max-w-[7rem] border-b border-b-transparent bg-transparent text-[--text-muted] focus:border-b focus:text-[--text] focus:outline-none"
                    id={`input-${i}`}
                  />
                </div>
              </div>
            </div>
          )

        if (isSelect(item))
          return (
            <div
              data-testid={`control-${item.id}`}
              className={cn('max-w-[105px]', {
                'opacity-25': item.disabled,
                hidden: item.hidden,
              })}
            >
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
                      {item.options.map(o => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )

        if (isCheckbox(item))
          return (
            <div
              data-testid={`control-${item.id}`}
              className={cn(
                'flex h-full cursor-pointer items-center gap-x-1.5',
                {
                  'opacity-25': item.disabled,
                  hidden: item.hidden,
                }
              )}
            >
              <input
                id={`checkbox-${i}`}
                type={item.type}
                defaultChecked={item.defaultChecked}
                onChange={item.onChange}
                className="cursor-pointer"
              />
              <label htmlFor={`checkbox-${i}`} className="cursor-pointer">
                {item.title}
              </label>
            </div>
          )
      })}
    </Fragment>
  ))
})

export const ConfigPanel = () => {
  const activeGroupId = useAppStore(s => s.activeGroupId)
  const mainItems = useMainItems()
  const { resetConfig } = useAppActions()
  const [key, setKey] = useState(Date.now())

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

  const handleResetConfig = () => {
    resetConfig()
    setKey(Date.now())
  }

  return (
    <div
      className="group/config flex w-full grid-cols-4 items-start gap-10 pt-1.5 text-sm"
      key={`group-${activeGroupId}-${key}`}
    >
      <FormItems items={mainItems} />
      <div className="ml-auto grid h-full items-center">
        <button
          type="button"
          onClick={handleResetConfig}
          className="text-secondary hover:text-inherit"
        >
          <RotateCw />
        </button>
      </div>
      {/* <div className="flex gap-2 text-[--text-muted]">
        <div className="flex items-center gap-x-1.5">
          <Select>
            <SelectTrigger className="w-[180px]" aria-label="Stroke options">
              Stroke options
            </SelectTrigger>
            <SelectContent align="end">
              <div className="px-4 py-3 grid gap-2"></div>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      {/* Config:
      <button type="button" onClick={handleLoadConfig}>
        Load
      </button>
      <button type="button" onClick={handleSaveConfig}>
        Save
      </button> */}
    </div>
  )
}
