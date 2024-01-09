import { forwardRef, memo, useRef } from 'react'
import { RemoveButton } from '@/components/RemoveButton'
import { useAppActions } from '@/hooks/appState'
import { iconBarrier } from '@/lib/icons'
import { cn } from '@/lib/utils'
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

const examples = [
  ['bug', { code: bugIcon, display: bugItemDisplay }],
  ['burd', { code: flyaway, display: flyawayIconDisplay }],
  ['cookie', { code: cookie, display: cookieIconDisplay }],
] as const

type ExampleItem = {
  onClick: () => void
  svg: JSX.Element
  title: string
}

function ExampleItem(props: ExampleItem) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="inline-flex gap-1 p-4"
    >
      {props.svg}
      <span>{props.title}</span>
    </button>
  )
}

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

  return (
    <div className="relative">
      <div className="grid gap-3">
        {Boolean(props.showRemove) && (
          <div className="grid grid-cols-2">
            <div className="absolute right-2 top-5">
              <RemoveButton
                onClick={() => {
                  removeEditor(props.id)
                }}
              />
            </div>
          </div>
        )}
        <div className="grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] rounded border md:grid">
          <div
            className={cn(
              'relative hidden bg-[--page-bg-dark] px-[25%] py-[15%] md:block'
            )}
          >
            <div className="grid h-full place-items-center">{iconBarrier}</div>
          </div>
          <div className={cn('relative px-8 py-5 md:pl-0')}>
            <div className="flex items-center">
              <div>
                <AddIconInput
                  ref={ref}
                  onEnterKey={handleUpdateEditor}
                  onUpload={handleOnUpload}
                />
                <div className="inline-flex items-center">
                  <div className="mr-3">Or add a</div>
                  {examples.map(item => (
                    <ExampleItem
                      onClick={() => {
                        handleUpdateEditor(item[1].code)
                      }}
                      key={item[0]}
                      svg={item[1].display}
                      title={item[0]}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export { Preview }
