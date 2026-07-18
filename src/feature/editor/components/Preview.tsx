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
        <div className="group/add relative overflow-hidden rounded-lg border text-xl transition-colors duration-300 hover:border-muted lg:text-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--bg))_95%)]" />
          <div className="relative grid justify-items-center gap-8 px-6 py-12 md:px-12 md:py-14">
            <div className="grid justify-items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl border bg-background text-muted shadow-[0_10px_35px_-10px_hsl(var(--secondary)/0.4)] transition-colors duration-300 group-hover/add:text-[--text-secondary] [&_svg]:h-8 [&_svg]:w-8">
                {iconBarrier}
              </div>
              <div className="grid justify-items-center gap-2 text-center">
                <h3 className="font-serif text-3xl font-bold text-[--text-secondary] lg:text-4xl">
                  Start your set
                </h3>
                <p className="text-base text-muted lg:text-lg">
                  Upload files, search the library or paste SVG code
                </p>
              </div>
            </div>
            <div className="grid w-full max-w-2xl gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Upload onUpload={handleOnUpload} className="w-full" />
                <Search
                  handleOnAfterAddExternalIcon={handleOnAfterAddExternalIcon}
                />
              </div>
              <div className="flex items-center gap-4 text-sm uppercase tracking-widest text-muted">
                <div className="h-px flex-1 bg-border" />
                or
                <div className="h-px flex-1 bg-border" />
              </div>
              <input
                ref={ref}
                type="text"
                className="w-full rounded border bg-background px-5 py-3 text-[--input-text] placeholder-[var(--text-muted)] caret-[--text-secondary] transition-colors duration-200 hover:border-muted focus:border-muted focus:outline-0"
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
