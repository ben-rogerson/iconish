import { useEffect, useMemo, useRef, useState } from 'react'
import { Editors } from '@/feature/editor/components/Editors'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { GroupSet } from '@/components/GroupSet'
import { ConfigPanel } from '@/feature/config/components/ConfigPanel'
import { type VirtuosoHandle } from 'react-virtuoso'

/**
 * Update the group list when the hash changes.
 * This is a hack to get around the fact that getGroup is not reactive.
 */
const useGroupRender = () => {
  const { getGroup } = useAppActions()
  const hash = useAppStore(s => s.updateListHash)
  const [group, setGroup] = useState(getGroup())
  useEffect(() => {
    setGroup(getGroup())
  }, [hash, getGroup])
  return group
}

const Detail = () => {
  const group = useGroupRender()
  // TODO: Move this ref to a provider?
  const virtualListRef = useRef<VirtuosoHandle>(null)

  const activeEditors = useMemo(
    () =>
      group?.editors.filter(
        ([, data]) =>
          data.svg.output &&
          data.svg.output !== '<html xmlns="http://www.w3.org/1999/xhtml"/>'
      ) ?? [],
    [group?.editors]
  )

  return (
    <div className="grid gap-16">
      {activeEditors.length > 0 ? (
        <div
          className="sticky -top-px z-50 flex gap-6 border-y bg-[--page-bg] px-4 py-3"
          role="toolbar"
        >
          <ConfigPanel />
        </div>
      ) : (
        <div className="border-t" />
      )}
      <div>
        {!!group && (
          <GroupSet
            id={group.id}
            title={group.title}
            createdAt={group.createdAt}
            // eslint-disable-next-line react/jsx-no-leaked-render
            icons={activeEditors.length > 1 ? activeEditors : []}
            virtualListRef={virtualListRef}
            isHeader
          />
        )}
        <Editors virtualListRef={virtualListRef} />
      </div>
    </div>
  )
}

export { Detail }
