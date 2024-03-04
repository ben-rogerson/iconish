import type { RefObject } from 'react'
import { memo, useEffect, useMemo, useState } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Editor } from '@/feature/editor/components/Editor'
import { EditorList } from '@/feature/editor/components/EditorList'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { cn } from '@/lib/utils'
import { Preview } from '@/feature/editor/components/Preview'

const Add = memo(function Memo(props: {
  onClick: () => void
  isTop?: boolean
  isVisible?: boolean
}) {
  const isVisible = props.isVisible ?? false
  return (
    <button
      className={cn(
        'group/add block w-full pb-8 pt-10',
        props.isTop ? '-top-16' : '-bottom-34'
      )}
      type="button"
      onClick={props.onClick}
      aria-label="Add SVG"
    >
      <div
        className={cn('grid h-px place-content-center rounded bg-border', {
          'invisible group-hover/add:visible': !isVisible,
        })}
      >
        <div className="bg-background px-5 text-xl">Insert blank icon</div>
      </div>
    </button>
  )
})

/**
 * Update the list when the hash changes.
 * This is a hack to get around the fact that getEditors is not reactive.
 */
const useEditorsRender = () => {
  const { getEditors } = useAppActions()
  const hash = useAppStore(s => s.updateListHash)
  const [editors, setEditors] = useState(getEditors())

  useEffect(() => {
    setEditors(getEditors())
  }, [hash, getEditors])
  return editors
}

const Editors = (props: { virtualListRef: RefObject<VirtuosoHandle> }) => {
  const { addEditorAfter } = useAppActions()
  const getEditors = useEditorsRender()

  const svgEditors = useMemo(
    () => getEditors.filter(e => e[1].svg.original !== '').length,
    [getEditors]
  )

  if (getEditors.length === 0) return

  return (
    <EditorList virtualListRef={props.virtualListRef}>
      {getEditors.map(([editorId, data], index) => {
        const showOutput = data.svg.original !== ''
        const showAdd = svgEditors > 0 || getEditors.length > 1
        return (
          <article
            id={editorId}
            key={editorId}
            className="relative"
            aria-label={showOutput ? 'editor' : 'preview'}
          >
            {Boolean(showAdd) && index === 0 && (
              <Add
                onClick={() => {
                  addEditorAfter()
                }}
                isTop
              />
            )}
            {showOutput ? (
              <Editor key={editorId} id={editorId} data={data} />
            ) : (
              <Preview id={editorId} showRemove={getEditors.length > 1} />
            )}
            {Boolean(showAdd) && (
              <Add
                onClick={() => {
                  addEditorAfter(editorId)
                }}
              />
            )}
          </article>
        )
      })}
    </EditorList>
  )
}

export { Editors }
