import type { MutableRefObject } from 'react'
import { Fragment, memo, useMemo, useRef, useState } from 'react'
import validateColor from 'validate-color'
import debounce from 'lodash/debounce'
import type { DebouncedFunc } from 'lodash'
import { RotateCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectMainLabel,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { cn } from '@/lib/utils'
import { run } from '@/utils/run'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import type { Group } from '@/utils/types'
import { ColorPicker } from '@/components/ColorPicker'

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
  theme: string
  hidden?: boolean
  disabled: boolean
  onChange: (color: string) => void
  onBlur: (color: string) => void
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
  description?: string
  defaultChecked: boolean
  type: 'checkbox'
  hidden?: boolean
  disabled: boolean
  onChange: (isChecked: boolean) => void
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

const FieldInput = (props: FormInput) => {
  const [color, setColor] = useState(props.defaultValue)

  const handleSetColor = (background: string) => {
    setColor(background)
    props.onChange(background)
  }

  return (
    <div
      data-testid={`control-${props.id}`}
      className={cn('grid gap-1.5', {
        'opacity-25': props.disabled,
        hidden: props.hidden,
      })}
      hidden={props.hidden ?? undefined}
    >
      <label htmlFor={`input-${props.id}`}>{props.title}</label>
      <div className="flex gap-2 text-muted">
        <div className="flex w-full items-center gap-x-1.5">
          <ColorPicker
            color={color}
            setColor={handleSetColor}
            onBlur={props.onBlur}
            disabled={props.disabled}
            id={`input-${props.id}`}
          />
        </div>
      </div>
    </div>
  )
}

export const FormItems = memo(function FormItems(props: {
  items: FormItemType[]
  type?: 'small'
}) {
  return props.items.map(item => (
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
              className={cn('grid gap-2 pb-3', {
                hidden: item.disabled,
              })}
              hidden={item.hidden ?? undefined}
            >
              {/* Can't have clickable label - htmlFor not supported with Slider */}
              <div id={`range-${item.id}-title`}>{item.title}</div>
              <div className="flex gap-2 text-muted">
                <div className="relative -mb-2 -mt-1 flex w-full items-center gap-1.5">
                  <Slider
                    defaultValue={[Number(item.defaultValue)]}
                    max={5}
                    min={1}
                    step={0.5}
                    aria-labelledby={`range-${item.id}-title`}
                    onValueChange={item.onChange}
                    id={`range-${item.id}`}
                    disabled={item.disabled}
                  />
                  <div className="min-w-[3ch]">{item.defaultValue}</div>
                </div>
              </div>
            </div>
          )

        if (isInput(item)) return <FieldInput {...item} />

        if (isSelect(item))
          return (
            <div
              data-testid={`control-${item.id}`}
              className={cn({
                'opacity-25': item.disabled,
              })}
              hidden={item.hidden ?? undefined}
            >
              <SelectMainLabel htmlFor={`select-${item.id}`}>
                {item.title}
              </SelectMainLabel>
              <div className="flex gap-2 text-muted">
                <div className="flex w-full items-center gap-x-1.5">
                  <Select
                    onValueChange={item.onChange}
                    defaultValue={item.defaultValue}
                  >
                    <SelectTrigger id={`select-${item.id}`}>
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
              className={cn({
                'opacity-25': item.disabled,
              })}
              hidden={item.hidden ?? undefined}
            >
              <label className="flex h-full cursor-pointer items-center gap-x-3">
                <Checkbox
                  id={`checkbox-${item.id}`}
                  defaultChecked={item.defaultChecked}
                  onCheckedChange={item.onChange}
                />
                <span>{item.title}</span>
              </label>
              {Boolean(item.description) && <div>{item.description}</div>}
            </div>
          )
      })}
    </Fragment>
  ))
})

const useConfigItems = () => {
  const { getConfig, setConfig } = useAppActions()
   
  const debounceRef = useRef<DebouncedFunc<() => void>>(null)
  const config = getConfig()

  const items = useMemo(
    () => [
      {
        id: 'fill-color',
        title: 'Fill',
        defaultValue: config.fill,
        type: 'text',
        theme: config.fill,
        hidden: config.iconSetType === 'outlined',
        disabled: config.iconSetType === 'outlined',
        onChange: color => {
          const fill =
            color &&
            (validateColor(color) ||
              (color.startsWith('var(--') && color.endsWith(')')))
              ? color
              : null
          if (!fill) return

          // Allow the color to be added, then update the config
          setTimeout(() => {
            setConfig({ fill })
          }, 0)
        },
        onBlur: color => {
          const fill =
            color &&
            (validateColor(color) ||
              (color.startsWith('var(--') && color.endsWith(')')))
              ? color
              : null
          if (!fill) {
            // Reset to previous value
            color = config.fill
            return
          }

          // Allow the color to be added, then update the config
          setTimeout(() => {
            color = config.fill
          }, 0)
        },
      } satisfies FormInput,
      {
        id: 'stroke-color',
        title: 'Stroke color',
        defaultValue: config.stroke,
        type: 'text',
        theme: config.stroke,
        hidden: config.iconSetType === 'solid',
        disabled: config.iconSetType === 'solid',
        onChange(color) {
          const stroke = color && isColor(color) ? color : null
          if (!stroke) return

          // Allow the color to be added, then update the config
          setTimeout(() => {
            setConfig({ stroke })
          }, 0)
        },
        onBlur: color => {
          if (isColor(color)) return
          color = config.stroke
        },
      } satisfies FormInput,
      {
        id: 'stroke-width',
        title: 'Stroke width',
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
      // {
      //   id: 'stroke-linecap',
      //   title: 'Stroke linecap',
      //   defaultValue: config.strokeLinecap,
      //   disabled: false,
      //   options: ['butt', 'round', 'square'],
      //   onChange: strokeLinecap => {
      //     setConfig({ strokeLinecap })
      //   },
      // } satisfies FormSelect,
      // {
      //   id: 'stroke-linejoin',
      //   title: 'Stroke linejoin',
      //   defaultValue: config.strokeLinejoin,
      //   disabled: false,
      //   options: ['arcs', 'bevel', 'miter', 'miter-clip', 'round'],
      //   onChange: strokeLinejoin => {
      //     setConfig({ strokeLinejoin })
      //   },
      // } satisfies FormSelect,
      {
        id: 'non-scaling-stroke',
        title: 'Non-scaling stroke',
        // description: 'Keep the stroke width consistent, no matter the size.',
        defaultChecked: config.nonScalingStroke,
        disabled: config.iconSetType === 'solid',
        hidden: config.iconSetType === 'solid',
        type: 'checkbox',
        onChange: isChecked => {
          setConfig({ nonScalingStroke: isChecked })
        },
      } satisfies FormCheckbox,
      {
        id: 'keep-ids',
        title: 'ID attributes',
        defaultChecked: !config.cleanupIds,
        disabled: false,
        type: 'checkbox',
        onChange: isChecked => {
          setConfig({ cleanupIds: !isChecked })
        },
      } satisfies FormCheckbox,
      {
        id: 'output-jsx',
        title: 'Output JSX',
        defaultChecked: config.outputJsx,
        disabled: false,
        type: 'checkbox',
        onChange: isChecked => {
          setConfig({ outputJsx: isChecked })
        },
      } satisfies FormCheckbox,
    ],
    [setConfig, config]
  )

  return items
}

export const ConfigPanel = (props: { activeEditors: Group['editors'] }) => {
  const activeGroupId = useAppStore(s => s.activeGroupId)
  const configItems = useConfigItems()
  const { resetConfig } = useAppActions()
  const [key, setKey] = useState(Date.now())

  const handleResetConfig = () => {
    resetConfig()
    setKey(Date.now())
  }

  const totalSaved =
    Math.round(
      props.activeEditors.reduce((acc, val) => val[1].svg.savings + acc, 0) *
        100
    ) / 100

  return (
    <div
      className="group/config space-y-5"
      key={`group-${activeGroupId}-${key}`}
    >
      <div className="pb-2.5 font-serif text-2xl">Icon set options</div>
      <FormItems items={configItems} />
      <div className="">
        <div className="top-2 mt-10 flex items-center justify-between gap-4 border-t pt-5">
          {totalSaved > 0 && (
            <div className="text-muted">Saved {totalSaved} KB</div>
          )}
          <button
            type="button"
            onClick={handleResetConfig}
            className="ml-auto flex flex-shrink-0 items-center gap-2 text-secondary hover:text-inherit"
          >
            <RotateCw className="-mt-1 w-4 hover:text-primary" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}
