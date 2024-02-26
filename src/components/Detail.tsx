import { useRef } from 'react'
import { type VirtuosoHandle } from 'react-virtuoso'
import { Editors } from '@/feature/editor/components/Editors'
import { GroupSet } from '@/components/GroupSet'
import type { Group } from '@/utils/types'
import { useAppActions } from '@/hooks/appState'

const Detail = (props: { group?: Group; activeEditors: Group['editors'] }) => {
  const { getConfig } = useAppActions()
  const virtualListRef = useRef<VirtuosoHandle>(null)

  return (
    <div className="grid gap-5">
      {props.activeEditors.length > 0 && (
        <div className="text-xl text-muted">
          <span className="capitalize">{getConfig().iconSetType}</span> set
        </div>
      )}
      {!!props.group && (
        <GroupSet
          id={props.group.id}
          title={props.group.title}
          createdAt={props.group.createdAt}
          count={props.activeEditors.length}
          // eslint-disable-next-line react/jsx-no-leaked-render
          icons={props.activeEditors.length > 1 ? props.activeEditors : []}
          virtualListRef={virtualListRef}
          isHeader
        />
      )}
      <Editors virtualListRef={virtualListRef} />
    </div>
  )
}

export { Detail }
