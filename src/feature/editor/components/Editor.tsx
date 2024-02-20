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
            '': l.type === 'debug',
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
              {l.msg}{' '}
              <span className="pointer-events-none text-xs opacity-50">
                {l.type}
              </span>
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
  const { getConfig, removeEditor, undoRemoveEditor, updateEditorSvg } =
    useAppActions()
  const [, copy] = useCopyToClipboard()
  const config = getConfig()

  const sanitizedSvg = useMemo(
    () => doSanitizeSvg(props.data.view?.doc ?? ''),
    [props.data.view?.doc]
  )

  const output = props.data.svg[config.outputJsx ? 'outputJsx' : 'output']

  const sized = useMemo(
    () => calculateSizeSavings(props.data.view?.doc ?? '', output),
    [props.data.view?.doc, output]
  )

  const handleOnChange = (value: string) => {
    updateEditorSvg(props.id, value)
  }

  const handleUndo = () => {
    undoRemoveEditor(props.id)
  }

  return (
    <div>
      <div className="pointer-events-none absolute -left-[20%] -top-[2%] h-[500px] w-full rotate-12 rounded-full opacity-30 blur-2xl dark:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(36,46,66,1)_0%,rgba(255,255,255,0.00)_100%)]" />
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
            className="grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] rounded-t border bg-[--page-bg-alt] md:grid"
            style={{ borderBottomStyle: 'dashed' }}
          >
            <div className={cn('relative px-[25%] py-[15%]')}>
              {Boolean(sanitizedSvg) && (
                <>
                  <div dangerouslySetInnerHTML={{ __html: sanitizedSvg }} />
                  <div className="absolute left-2 top-2 hidden text-xs text-muted group-focus-within/editor:block group-hover/editor:block">
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
                extensions={[
                  javascript({ jsx: true }),
                  EditorView.lineWrapping,
                ]}
                onChange={handleOnChange}
                theme={vscodeDark}
                value={props.data.view?.doc ?? ''}
                editable
              />
            </div>
          </div>
        </div>
        <div className="bg-[--page-bg-alt]">
          {Boolean(output) && (
            <div
              className="relative grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] border border-t-0 md:grid"
              style={{ borderBottomStyle: 'dashed' }}
            >
              <div className="relative px-[25%] pb-[25%] pt-[15%]">
                <div
                  dangerouslySetInnerHTML={{ __html: props.data.svg.output }}
                />
                <div className="absolute left-2 top-2 hidden text-xs text-muted group-focus-within/editor:block group-hover/editor:block">
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
                  value={output}
                  readOnly
                />
              </div>
              <div className="absolute bottom-2 right-2">
                <Button
                  aria-label="Copy svg code to clipboard"
                  type="button"
                  onClick={() => {
                    copy(output).catch(() => null)
                    toast({
                      itemID: `copied-${props.id}`,
                      title: `Copied svg code to clipboard`,
                    })
                  }}
                  variant="ghost"
                  className="rounded text-muted"
                >
                  <Copy width={15} />
                </Button>
              </div>
            </div>
          )}
          {(props.data.svg.log ?? []).length > 0 && (
            <div className="rounded-b border border-t-0">
              <Log logItems={props.data.svg.log} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Editor }
