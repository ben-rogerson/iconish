import { useRef } from 'react'
import { type VirtuosoHandle } from 'react-virtuoso'
import { Editors } from '@/feature/editor/components/Editors'
import { GroupSet } from '@/components/GroupSet'
import type { Group, IconSetType } from '@/utils/types'

const Detail = (props: {
  group?: Group
  activeEditors: Group['editors']
  iconSetType?: IconSetType
}) => {
  const virtualListRef = useRef<VirtuosoHandle>(null)
  const showSetType = props.iconSetType !== 'indeterminate'
  return (
    <div className="grid">
      <div className="grid gap-6">
        {Boolean(showSetType) && (
          <div className="text-xl text-muted">
            <span className="capitalize">{props.iconSetType}</span> set
          </div>
        )}
        {!!props.group && (
          <GroupSet
            id={props.group.id}
            title={props.group.title}
            createdAt={props.group.createdAt}
            count={props.activeEditors.length}
            icons={props.activeEditors}
            virtualListRef={virtualListRef}
            isHeader
          />
        )}
      </div>
      <Editors virtualListRef={virtualListRef} />
    </div>
  )
}

export { Detail }
