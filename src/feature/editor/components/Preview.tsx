import { forwardRef, memo, useRef } from 'react'
import { RemoveButton } from '@/components/RemoveButton'
import { useAppActions } from '@/hooks/appState'
import { diceIcon, iconBarrier } from '@/lib/icons'
import {
  bugIcon,
  bugItemDisplay,
  flyaway,
  flyawayIconDisplay,
  cookie,
  cookieIconDisplay,
} from '@/lib/icons'
import { Upload } from '@/components/Upload'

type PreviewProps = {
  id: string
  showRemove: boolean
}

const AddIconInput = forwardRef<
  HTMLInputElement,
  {
    onEnterKey: (value: string) => void
    onUpload: (value: Set<[string, string]>) => void
  }
>((props, ref) => {
  return (
    <div className="flex items-center gap-1">
      <Upload onUpload={props.onUpload} />
      <div className="px-8 text-[150%] text-[--text-muted]">/</div>
      <input
        ref={ref}
        type="text"
        className="w-full bg-transparent py-3 text-[170%] text-[--input-text] placeholder-[var(--text-muted)] focus:outline-0"
        placeholder="Paste svg&hellip;"
        onKeyDown={e => {
          if (e.key !== 'Enter') return
          props.onEnterKey(e.currentTarget.value)
        }}
      />
    </div>
  )
})

AddIconInput.displayName = 'AddIconInput'

function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const examples = [
  ['bug', { code: bugIcon, display: bugItemDisplay }],
  ['burd', { code: flyaway, display: flyawayIconDisplay }],
  ['cookie', { code: cookie, display: cookieIconDisplay }],
] as const

// type ExampleItem = {
//   onClick: () => void
//   svg: JSX.Element
//   title: string
// }

// function ExampleItem(props: ExampleItem) {
//   return (
//     <button
//       type="button"
//       onClick={props.onClick}
//       className="inline-flex gap-1 p-4"
//     >
//       {props.svg}
//       <span>{props.title}</span>
//     </button>
//   )
// }

const Preview = memo(function Preview(props: PreviewProps) {
  const { removeEditor, updateEditorSvg, addEditor } = useAppActions()
  const ref = useRef<HTMLInputElement>(null)

  const handleUpdateEditor = (value: string) => {
    updateEditorSvg(props.id, value)
  }

  const handleOnUpload = (values: Set<[string, string]>) => {
    ;[...values].forEach(([fileName, svgCode]) => {
      addEditor(svgCode, fileName)
    })
  }

  const handleAddRandomIcon = () => {
    const randomIndex = getRandomIntInclusive(0, examples.length - 1)
    const example = examples[randomIndex]
    addEditor(example[1].code, example[0])
    removeEditor(props.id)
  }

  return (
    <div
      className="group/editor relative"
      style={{
        boxShadow: 'inset 0 0 0 3px hsl(var(--bg))',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3E%3Cpath fill='%23475c85' fill-opacity='0.075' d='M0 40a19.96 19.96 0 0 1 5.9-14.11 20.17 20.17 0 0 1 19.44-5.2A20 20 0 0 1 20.2 40H0zM65.32.75A20.02 20.02 0 0 1 40.8 25.26 20.02 20.02 0 0 1 65.32.76zM.07 0h20.1l-.08.07A20.02 20.02 0 0 1 .75 5.25 20.08 20.08 0 0 1 .07 0zm1.94 40h2.53l4.26-4.24v-9.78A17.96 17.96 0 0 0 2 40zm5.38 0h9.8a17.98 17.98 0 0 0 6.67-16.42L7.4 40zm3.43-15.42v9.17l11.62-11.59c-3.97-.5-8.08.3-11.62 2.42zm32.86-.78A18 18 0 0 0 63.85 3.63L43.68 23.8zm7.2-19.17v9.15L62.43 2.22c-3.96-.5-8.05.3-11.57 2.4zm-3.49 2.72c-4.1 4.1-5.81 9.69-5.13 15.03l6.61-6.6V6.02c-.51.41-1 .85-1.48 1.33zM17.18 0H7.42L3.64 3.78A18 18 0 0 0 17.18 0zM2.08 0c-.01.8.04 1.58.14 2.37L4.59 0H2.07z'%3E%3C/path%3E%3C/svg%3E")`,
      }}
    >
      <div className="grid gap-3">
        {Boolean(props.showRemove) && (
          <div className="absolute right-2 top-2">
            <RemoveButton
              onClick={() => {
                removeEditor(props.id)
              }}
            />
          </div>
        )}
        <div className="grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] rounded border text-2xl md:grid">
          <div className="relative grid place-items-center px-[25%] text-[--text-muted]">
            {iconBarrier}
          </div>
          <div className="relative grid gap-4 py-10 pr-12">
            <div className="grid grid-cols-2 gap-5">
              <Upload onUpload={handleOnUpload} className="w-full" />
              <button
                type="button"
                onClick={handleAddRandomIcon}
                className="flex h-full w-full items-center justify-center gap-3 rounded border px-5 py-3"
              >
                <div>{diceIcon}</div>
                <div>Random SVG</div>
              </button>
            </div>

            <div className="grid items-center">
              <input
                ref={ref}
                type="text"
                className="w-full rounded border bg-transparent px-5 py-3 text-[--input-text] placeholder-[var(--text-muted)] caret-[--text-secondary] focus:outline-0"
                placeholder="Paste SVG, eg: <svg><path .../></svg>"
                onKeyDown={e => {
                  if (e.key !== 'Enter') return
                  handleUpdateEditor(e.currentTarget.value)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export { Preview }
