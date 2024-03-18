import type { RefObject } from 'react'
import { forwardRef, memo, useRef } from 'react'
import { RemoveButton } from '@/components/RemoveButton'
import { useAppActions } from '@/hooks/appState'
import { iconBarrier } from '@/lib/icons'
import { Upload } from '@/components/Upload'
import { useToast } from '@/components/ui/use-toast'
import Search from '@/feature/svg/components/Search'
import type { VirtuosoHandle } from 'react-virtuoso'

type PreviewProps = {
  id: string
  showRemove: boolean
  virtualListRef: RefObject<VirtuosoHandle>
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
      <div className="px-8 text-[150%] text-muted">/</div>
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
  const { removeEditor, addEditor, updateEditorSvg } = useAppActions()
  const { toast } = useToast()
  const ref = useRef<HTMLInputElement>(null)

  const handlePasteSvg = (svgCode: string) => {
    const hasUpdated = updateEditorSvg(props.id, svgCode, {
      allowSvgOnly: true,
    })

    if (!hasUpdated) {
      toast({ title: 'Invalid SVG' })
      return
    }
  }

  const handleOnUpload = (values: Set<[string, string]>) => {
    // Order and add the icons by fileName
    const sortedValues = Array.from(values)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reverse()
    for (const [fileName, svgCode] of sortedValues) {
      addEditor(svgCode, fileName, { after: props.id })
    }
    removeEditor(props.id)
  }

  const handleOnAfterAddExternalIcon = (svgCode: string, name: string) => {
    const { newIndex } = addEditor(svgCode, name, {
      after: props.id,
      removeAfter: true,
    })
    props.virtualListRef.current?.scrollToIndex({
      index: newIndex,
      behavior: 'smooth',
    })
  }

  return (
    <div className="editor group/editor relative">
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
        <div className="grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] rounded border text-xl md:grid lg:text-2xl">
          <div className="relative hidden place-items-center px-[25%] text-muted md:grid">
            {iconBarrier}
          </div>
          <div className="relative grid gap-4 px-12 py-10 md:pl-0">
            <div className="grid grid-cols-2 gap-5">
              <Upload onUpload={handleOnUpload} className="w-full" />
              <Search
                handleOnAfterAddExternalIcon={handleOnAfterAddExternalIcon}
              />
            </div>

            <div className="grid items-center">
              <input
                ref={ref}
                type="text"
                className="w-full rounded border bg-background px-5 py-3 text-[--input-text] placeholder-[var(--text-muted)] caret-[--text-secondary] focus:outline-0"
                placeholder="Paste SVG, eg: <svg><path ... /></svg>"
                onKeyDown={e => {
                  if (e.key !== 'Enter') return
                  handlePasteSvg(e.currentTarget.value)
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
