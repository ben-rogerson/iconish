import { useMemo, useState } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'
import { EditorView } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { Button } from '@/components/ui/button'
import { RemoveButton } from '@/components/RemoveButton'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Title } from '@/feature/editor/components/Title'
import { doSanitizeSvg } from '@/feature/svg/svgTasks'
import { useAppActions } from '@/hooks/appState'
import { calculateSizeSavings } from '@/utils/calculateSizeSavings'
import { type EditorState } from '@/utils/types'
import { cn } from '@/lib/utils'
import { Copy, Check, Lightbulb, X } from 'lucide-react'

type EditorProps = {
  id: string
  data: EditorState[1]
}

const Log = (props: { logItems: EditorProps['data']['svg']['log'] }) => {
  const [isOpened, setIsOpened] = useState(false)

  const filtered = (type: string) =>
    isOpened
      ? !type.startsWith('data.')
      : ['success', 'error', 'info'].includes(type)

  const items = (props.logItems ?? [])
    .filter(l => filtered(l.type))
    .map((l, i) => {
      return (
        <li
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={cn({
            'text-red-500': l.type === 'error',
            'text-green-500': l.type === 'success',
            'text-gray-500': l.type === 'debug',
            'text-orange-300': l.type === 'info',
          })}
        >
          <div className="flex gap-2">
            <div className="flex-shrink-0 text-right">
              {l.type === 'error' && <X className="text-red-500" width="18" />}
              {l.type === 'debug' && (
                <Lightbulb className="text-gray-500" width="18" />
              )}
              {l.type === 'success' && (
                <Check className="text-green-600" width="18" />
              )}
              {l.type === 'info' && (
                <Check className="text-orange-300" width="18" />
              )}
            </div>
            <div>
              {l.msg} <span className="text-xs opacity-50">{l.type}</span>
            </div>
          </div>
        </li>
      )
    })

  return (
    <div className="relative grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] justify-between md:grid">
      <button
        type="button"
        onClick={() => {
          setIsOpened(o => !o)
        }}
        className="absolute inset-0 cursor-ns-resize"
      />
      <div className="flex gap-2 px-7 pt-7">{Boolean(isOpened) && 'log'}</div>
      <div className="flex justify-between gap-2 py-3">
        <ul className={cn({ 'py-5': isOpened })}>{items}</ul>
      </div>
    </div>
  )
}

const Editor = (props: EditorProps) => {
  const { toast } = useToast()
  const { removeEditor, undoRemoveEditor, updateEditorSvg } = useAppActions()
  const [, copy] = useCopyToClipboard()

  const sanitizedSvg = useMemo(
    () => doSanitizeSvg(props.data.view?.doc ?? ''),
    [props.data.view?.doc]
  )
  const sized = useMemo(
    () =>
      calculateSizeSavings(props.data.view?.doc ?? '', props.data.svg.output),
    [props.data.view?.doc, props.data.svg.output]
  )

  const handleOnChange = (value: string) => {
    updateEditorSvg(props.id, value)
  }

  const handleUndo = () => {
    undoRemoveEditor(props.id)
  }

  return (
    <div className="group/editor relative">
      <div className="grid gap-3">
        <div className="grid grid-cols-2">
          <div className="absolute right-0 top-3">
            <RemoveButton
              onClick={() => {
                removeEditor(props.id)
                toast({
                  itemID: props.id,
                  title: `Removed icon${
                    props.data.title ? ` “${props.data.title}”` : ''
                  }`,
                  action: (
                    <ToastAction altText="Undo" onClick={handleUndo}>
                      Undo
                    </ToastAction>
                  ),
                })
              }}
            />
          </div>
          <Title id={props.id} title={props.data.title} />
        </div>
        <div
          className="grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] rounded-t border md:grid"
          style={{
            borderBottomStyle: 'dashed',
            // boxShadow: 'inset 0 0 0 3px hsl(var(--bg))',
            // backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3E%3Cpath fill='%23475c85' fill-opacity='0.15' d='M0 40a19.96 19.96 0 0 1 5.9-14.11 20.17 20.17 0 0 1 19.44-5.2A20 20 0 0 1 20.2 40H0zM65.32.75A20.02 20.02 0 0 1 40.8 25.26 20.02 20.02 0 0 1 65.32.76zM.07 0h20.1l-.08.07A20.02 20.02 0 0 1 .75 5.25 20.08 20.08 0 0 1 .07 0zm1.94 40h2.53l4.26-4.24v-9.78A17.96 17.96 0 0 0 2 40zm5.38 0h9.8a17.98 17.98 0 0 0 6.67-16.42L7.4 40zm3.43-15.42v9.17l11.62-11.59c-3.97-.5-8.08.3-11.62 2.42zm32.86-.78A18 18 0 0 0 63.85 3.63L43.68 23.8zm7.2-19.17v9.15L62.43 2.22c-3.96-.5-8.05.3-11.57 2.4zm-3.49 2.72c-4.1 4.1-5.81 9.69-5.13 15.03l6.61-6.6V6.02c-.51.41-1 .85-1.48 1.33zM17.18 0H7.42L3.64 3.78A18 18 0 0 0 17.18 0zM2.08 0c-.01.8.04 1.58.14 2.37L4.59 0H2.07z'%3E%3C/path%3E%3C/svg%3E")`,
          }}
        >
          <div className={cn('relative bg-[--page-bg-dark] px-[25%] py-[15%]')}>
            {Boolean(sanitizedSvg) && (
              <>
                <div dangerouslySetInnerHTML={{ __html: sanitizedSvg }} />
                <div className="absolute left-2 top-2 hidden text-xs text-[--text-muted] group-focus-within/editor:block group-hover/editor:block">
                  {sized.before}
                </div>
              </>
            )}
            {/* <div className="absolute -bottom-px left-1/2 top-full h-[25px] w-px origin-top-left bg-[--border] after:absolute after:bottom-px after:h-2 after:w-2 after:-translate-x-[50%] after:-rotate-45 after:border-b after:border-l after:border-b-[--border] after:border-l-[--border]" /> */}
          </div>
          <div className="relative p-6 pl-0">
            {/* {(props.data.view?.doc.length ?? 0) > 30 && (
              <div className="absolute right-6 top-0 -mt-2.5 flex justify-end bg-[--page-bg] px-1.5 group-focus-within/editor:block group-hover/editor:block md:hidden">
                <WordWrapIn />
              </div>
            )} */}

            <CodeMirror
              extensions={[javascript({ jsx: true }), EditorView.lineWrapping]}
              onChange={handleOnChange}
              theme={vscodeDark}
              value={props.data.view?.doc ?? ''}
              editable={false}
            />
          </div>
        </div>
      </div>
      <div>
        <div
          className="relative grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] border border-t-0 md:grid"
          style={{ borderBottomStyle: 'dashed' }}
        >
          <div className="relative bg-[--page-bg-dark] px-[25%] pb-[25%] pt-[15%]">
            <div dangerouslySetInnerHTML={{ __html: props.data.svg.output }} />
            <div className="absolute left-2 top-2 hidden text-xs text-[--text-muted] group-focus-within/editor:block group-hover/editor:block">
              {sized.after}
            </div>
          </div>
          <div className="relative p-6 pl-0">
            {/* {props.data.svg.output.length > 30 && (
                <div className="absolute right-6 top-0 -mt-2.5 flex justify-end bg-[--page-bg] px-1.5 group-focus-within/editor:block group-hover/editor:block md:hidden">
                  <WordWrapOut />
                </div>
              )} */}
            <CodeMirror
              extensions={[
                javascript({ jsx: true }),
                EditorView.editable.of(false),
                EditorView.lineWrapping,
              ]}
              theme={vscodeDark}
              value={props.data.svg.output}
              // onUpdate={handleOnUpdateOut}
            />
          </div>
          <div className="absolute bottom-2 right-2">
            <Button
              type="button"
              onClick={() => {
                copy(props.data.svg.output).catch(() => null)
                toast({
                  itemID: `copied-${props.id}`,
                  title: `Copied svg code to clipboard`,
                })
              }}
              variant="ghost"
              className="text-[--text-muted]"
            >
              <Copy width={15} />
            </Button>
          </div>
        </div>
        <div className="rounded-b border border-t-0">
          <Log logItems={props.data.svg.log} />
        </div>
      </div>
    </div>
  )
}

export { Editor }
