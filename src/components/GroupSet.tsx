import { useAppActions } from '@/hooks/appState'
import { cn } from '@/lib/utils'
import type { RefObject } from 'react'
import {
  type FunctionComponent,
  useEffect,
  useState,
  useRef,
  memo,
} from 'react'
import { type Group } from '@/utils/types'
import { Copy, Download, Layers, MoreVertical, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useCopySvgsToClipboard,
  useDownloadSvgsForGroup,
} from '@/feature/svg/svg.hooks'
import { useToast } from '@/components/ui/use-toast'
import { useCallback, useId } from 'react'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  useSensors,
  PointerSensor,
  useSensor,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableItem } from '@/components/SortableItem'
import type { VirtuosoHandle } from 'react-virtuoso'
import { relativeTime } from '@/utils/relativeTime'
import { SheetClose } from '@/components/ui/sheet'

export function Menu(props: {
  title: string
  groupId: string
  createdAt: number
  hasIcons: boolean
  isLarge: boolean
}) {
  const { removeGroup } = useAppActions()
  const { toast } = useToast()
  const copyAll = useCopySvgsToClipboard(props.groupId)
  const downloadSvgs = useDownloadSvgsForGroup(props.groupId, props.title)

  const handleRemoveGroup = () => {
    const { hasRemoved } = removeGroup(props.groupId)
    toast({
      title: hasRemoved
        ? `Deleted ‘${props.title || 'Untitled set'}’ icon set`
        : 'Add another set first, then you can delete this one',
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="More options">
          <MoreVertical
            className={cn('text-muted hover:text-primary', {
              'h-10 w-10': props.isLarge,
            })}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          {!!props.createdAt && (
            <>
              Created <time>{relativeTime(props.createdAt)}</time>
            </>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={copyAll.copy} disabled={!props.hasIcons}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy all SVGs</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadSvgs}>
            <Download className="mr-2 h-4 w-4" />
            <span>Download all SVGs</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Layers className="mr-2 h-4 w-4" />
            <span>Copy sprite sheet</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRemoveGroup}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete set</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Header: FunctionComponent<{
  id: string
  title: string
  isCurrent: boolean
  isLarge: boolean
  hasIcons: boolean
  createdAt: number
  updateGroupTitle: (groupId: string, title: string) => void
}> = props => {
  // Perf: Local title state, with updates on input blur / enter
  const [title, setTitle] = useState(props.title)

  useEffect(() => {
    setTitle(props.title)
  }, [props.title, props.id])

  return (
    <div className="grid gap-4">
      <header className="relative flex justify-between">
        <div className="grid w-full gap-2">
          <input
            type="text"
            aria-label="Icon set title"
            value={title}
            placeholder={title ? '' : 'Add set title…'}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(e.currentTarget.value)
            }}
            onBlur={() => {
              props.updateGroupTitle(props.id, title)
            }}
            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key !== 'Enter') return
              props.updateGroupTitle(props.id, title)
            }}
            className={cn(
              `w-[inherit] bg-transparent text-2xl`,
              `hover:text-text focus:text-[--text] focus:outline-none`,
              `font-serif placeholder-[--text-muted] placeholder:italic hover:placeholder-[--text]`,
              props.isLarge && `text-4xl sm:text-5xl`
            )}
          />
        </div>
        <div className="-mt-2.5 flex">
          <Menu
            groupId={props.id}
            createdAt={props.createdAt}
            title={props.title}
            hasIcons={props.hasIcons}
            isLarge={props.isLarge}
          />
        </div>
      </header>
    </div>
  )
}

type GroupSetBlock = {
  id: Group['id']
  title: Group['title']
  createdAt: Group['createdAt']
  icons: Group['editors']
  count: number
  isCurrent?: boolean
  isHeader?: boolean
  virtualListRef?: RefObject<VirtuosoHandle>
}

export const GroupSet = memo(function GroupSet(props: GroupSetBlock) {
  const { updateGroupTitle, setActiveGroup } = useAppActions()

  const hasIcons = props.icons.length > 0
  const hiddenCount =
    !props.isHeader && props.count && props.count > props.icons.length
      ? props.count - props.icons.length
      : 0

  const handleSelectGroup = (groupId: string) => {
    setActiveGroup(groupId)

    // Scroll to the top of the page
    setTimeout(() => {
      document.querySelector(`#top`)?.scrollIntoView()
    }, 0)
  }

  return (
    <article
      key={props.id}
      className={cn('group/set grid', {
        'gap-8': props.isHeader,
        'gap-2': !props.isHeader,
      })}
      aria-label={props.isHeader ? 'Current set' : 'Icon set'}
    >
      <Header
        id={props.id}
        title={props.title}
        updateGroupTitle={updateGroupTitle}
        isCurrent={props.isCurrent ?? false}
        createdAt={props.createdAt}
        hasIcons={hasIcons}
        isLarge={props.isHeader ?? true}
      />
      {Boolean(hasIcons) && (
        <div className="group relative @container">
          <div
            className={cn(
              'pointer-events-none grid',
              'grid-cols-4 @lg:grid-cols-5 @2xl:grid-cols-8 @4xl:grid-cols-12',
              props.isHeader &&
                '[&>*]:bg-[linear-gradient(0deg,transparent_29.9%,hsl(var(--border))_30%,transparent_32%,transparent_49.9%,hsl(var(--border))_50%,transparent_52%,transparent_69.9%,hsl(var(--border))_70%,transparent_72%)]'
            )}
          >
            <div className="z-10 grid place-content-center text-center font-serif">
              <div className="-mb-1 block text-lg">{props.count}</div>
              <div className="text-md">
                {props.count === 1 ? 'icon' : 'icons'}
              </div>
            </div>

            {props.isHeader && props.virtualListRef ? (
              <IconListDraggable
                id={props.id}
                icons={props.icons}
                title={props.title}
                virtualListRef={props.virtualListRef}
              />
            ) : (
              <IconList icons={props.icons} />
            )}

            {hiddenCount > 0 && (
              <div className="grid place-items-center text-lg">
                +{hiddenCount}
              </div>
            )}
          </div>
          {!props.isHeader && (
            <SheetClose asChild>
              <button
                type="button"
                onClick={() => {
                  handleSelectGroup(props.id)
                }}
                className={cn(
                  'absolute inset-0 z-0 cursor-pointer rounded border opacity-0',
                  'hover:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100'
                )}
              />
            </SheetClose>
          )}
        </div>
      )}
      {!props.isHeader && Boolean(!hasIcons) && (
        <div className="relative z-10">
          <div className="py-5 text-muted">No icons added yet.</div>
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => {
                handleSelectGroup(props.id)
              }}
              className="absolute inset-0 z-0 cursor-pointer rounded-lg"
            />
          </SheetClose>
        </div>
      )}
    </article>
  )
})

const IconListDraggable = (props: {
  id: string
  icons: Group['editors']
  title: string
  virtualListRef: RefObject<VirtuosoHandle>
}) => {
  const { setEditorOrderByIds, getEditors } = useAppActions()
  const { setActiveGroup } = useAppActions()
  const sortableContextId = useId()
  const sensors = useSensors(
    // Allow onClick events alongside dragging
    // https://github.com/clauderic/dnd-kit/issues/591#issuecomment-1017050816
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const setActiveIcon = (groupId: string, id: string) => {
    setActiveGroup(groupId)

    props.virtualListRef.current?.scrollToIndex({
      index: getEditors().findIndex(e => e[0] === id),
      align: 'start',
      behavior: 'smooth',
    })
  }

  const idList = useRef<string[]>([])
  const componentList = props.icons.map(([id, data], i) => {
    idList.current.push(id)

    const hasError = data.svg.log?.some(l => ['error', 'info'].includes(l.type))

    return (
      <SortableItem
        // eslint-disable-next-line react/no-array-index-key
        key={`${i}-${id}`}
        id={id}
        handleOnClick={() => {
          setActiveIcon(props.id, id)
        }}
      >
        <div className="grid">
          <div
            dangerouslySetInnerHTML={{ __html: data.svg.output }}
            className={cn(
              'relative z-10 rounded border border-transparent p-[25%] hover:border-[--text-muted] hover:shadow-sm @sm:px-[32%] @sm:py-[20%] @3xl:px-[22%]',
              { 'border-red-800': hasError }
            )}
          />
        </div>
      </SortableItem>
    )
  })

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const oldIndex = idList.current.indexOf(String(active.id))
      const newIndex = idList.current.indexOf(String(over.id))

      if (active.id !== over.id) {
        const movedList = arrayMove(componentList, oldIndex, newIndex)

        const newEditorOrder = movedList.filter(Boolean).map(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
          item => item.props.id
        ) as string[]

        setEditorOrderByIds(newEditorOrder)
      }
    },
    [componentList, idList, setEditorOrderByIds]
  )

  return (
    <DndContext
      id={sortableContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={idList.current} strategy={rectSortingStrategy}>
        {componentList}
      </SortableContext>
      {/* <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay> */}
    </DndContext>
  )
}

const IconList = (props: { icons: Group['editors'] }) =>
  props.icons.map(([id, data], i) => (
    <div
      // eslint-disable-next-line react/no-array-index-key
      key={`${i}-${id}`}
      dangerouslySetInnerHTML={{ __html: data.svg.output }}
      className="relative z-10 rounded border border-transparent p-5 hover:border-[--text-muted] hover:shadow-sm"
    />
  ))
