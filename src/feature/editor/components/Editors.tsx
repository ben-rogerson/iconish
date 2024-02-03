import type { RefObject } from 'react'
import { memo, useEffect, useMemo, useState } from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Editor } from '@/feature/editor/components/Editor'
import { EditorList } from '@/feature/editor/components/EditorList'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { cn, tw } from '@/lib/utils'
import { Preview } from '@/feature/editor/components/Preview'

const Add = memo(function Memo(props: {
  onClick: () => void
  isTop?: boolean
  isVisible?: boolean
}) {
  const isVisible = props.isVisible ?? false
  return (
    <button
      className={tw(
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
        <div className="bg-[--page-bg] px-5 text-xl">Insert blank icon</div>
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

const EndBlock = () => (
  <div className="py-16">
    <div className="h-1 rounded bg-border" />
  </div>
)

const Editors = (props: { virtualListRef: RefObject<VirtuosoHandle> }) => {
  const { addEditorAfter } = useAppActions()
  const getEditors = useEditorsRender()

  const editorCount = useMemo(
    () =>
      getEditors.filter(
        e => e[1].svg.output !== '' && e[1].svg.output.includes('<svg')
      ).length,
    [getEditors]
  )

  if (getEditors.length === 0)
    return (
      <div className="pt-20">
        <Preview id="none" showRemove={false} />
      </div>
    )

  return (
    <EditorList virtualListRef={props.virtualListRef}>
      {getEditors.map(([editorId, data], index) => {
        const showOutput =
          data.svg.output !== '' && data.svg.output.includes('<svg')
        const showAdd = editorCount > 0
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
            {!showAdd && (
              <div className="pt-16" /> // Hack
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
      <EndBlock />
    </EditorList>
  )
}

export { Editors }
