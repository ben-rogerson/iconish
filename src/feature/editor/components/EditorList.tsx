import type { RefObject } from 'react'
import React from 'react'
import type { VirtuosoHandle } from 'react-virtuoso'
import { Virtuoso } from 'react-virtuoso'

interface MessageListProps {
  children: React.ReactNode
  virtualListRef: RefObject<VirtuosoHandle>
}

const EditorList: React.FC<MessageListProps> = props => {
  // Convert ReactNode children to an array of elements.
  const childrenArray = React.Children.toArray(props.children)
  const itemContent = (index: number) => <div>{childrenArray[index]}</div>

  return (
    <div className="flex flex-grow">
      <Virtuoso
        ref={props.virtualListRef}
        useWindowScroll
        data={childrenArray}
        style={{
          width: '100%',
          minHeight: '1px', // Unsure why this is needed, otherwise list isn't rendered on load
        }}
        totalCount={childrenArray.length}
        itemContent={itemContent}
      />
    </div>
  )
}

export { EditorList }
