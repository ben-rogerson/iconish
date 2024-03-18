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

  const editorsWithContent = useMemo(
    () => getEditors({ withPlaceholders: false }).length,
    [getEditors]
  )

  return { editors, editorsWithContent }
}

const Editors = (props: { virtualListRef: RefObject<VirtuosoHandle> }) => {
  const { addEditorAfter } = useAppActions()
  const { editors } = useEditorsRender()

  if (editors.length === 0) return

  const showAdd = true

  return (
    <EditorList virtualListRef={props.virtualListRef}>
      {editors.map(([editorId, data], index) => {
        const showOutput = data.svg.original !== ''
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
              <Preview
                id={editorId}
                showRemove={editors.length > 1}
                virtualListRef={props.virtualListRef}
              />
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
