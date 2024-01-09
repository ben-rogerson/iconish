import { useAppActions } from '@/hooks/appState'
import { cn, tw } from '@/lib/utils'
import type { RefObject } from 'react'
import {
  useEffect,
  type FunctionComponent,
  useState,
  useRef,
  memo,
} from 'react'
import { type Group } from '@/utils/types'
import { AlertOctagon, Copy, Layers, MoreVertical, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCopySvgsToClipboard } from '@/feature/svg/svg.hooks'
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
}) {
  const { removeGroup } = useAppActions()
  const { toast } = useToast()
  const copyAll = useCopySvgsToClipboard(props.groupId)

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
          <MoreVertical />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          Icon set
          {!!props.createdAt && (
            <>
              <br />
              Added <time>{relativeTime(props.createdAt)}</time>
            </>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={copyAll.copy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>
              Copy optimized SVGs{copyAll.hasCopied ? 'All copied' : ''}
            </span>
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
  createdAt: number
  updateGroupTitle: (groupId: string, title: string) => void
}> = props => {
  // Perf: Local title state, with updates on input blur / enter
  const [title, setTitle] = useState(props.title)
  useEffect(() => {
    setTitle(props.title)
  }, [props.title, props.id])

  return (
    <header
      className={tw('relative flex justify-between', props.isLarge && 'pb-3')}
    >
      <div className="grid w-full gap-2">
        <input
          type="text"
          aria-label="Icon set title"
          value={title}
          placeholder={title ? '' : 'Untitled set…'}
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
          className={tw(
            `w-[inherit] bg-transparent text-xl text-[--text-muted]`,
            `focus:text-[--text] focus:outline-none`,
            `placeholder-[--text-muted] placeholder:italic`,
            props.isLarge && `text-5xl tracking-tight`
          )}
        />
      </div>
      {/* <div className="flex justify-end gap-10"> */}
      {/* <div>View spritesheet</div> */}
      <div className="flex">
        <Menu
          groupId={props.id}
          createdAt={props.createdAt}
          title={props.title}
        />
        {/* <RemoveButton onClick={() => props.removeGroup(props.id)} /> */}
      </div>
      {/* </div> */}
    </header>
  )
}

type GroupSetBlock = {
  id: Group['id']
  title: Group['title']
  createdAt: Group['createdAt']
  icons: Group['editors']
  count?: number
  isCurrent?: boolean
  isHeader?: boolean
  virtualListRef?: RefObject<VirtuosoHandle>
}

export const GroupSet = memo(function GroupSet(props: GroupSetBlock) {
  const { updateGroupTitle, setActiveGroup } = useAppActions()
  // const { toast } = useToast();

  const iconCount = props.count ?? props.icons.length
  const hasIcons = props.icons.length > 0
  const hiddenCount =
    !props.isHeader && props.count && props.count > props.icons.length
      ? props.count - props.icons.length
      : 0

  const handleSelectGroup = (groupId: string) => {
    const { hasSwitched } = setActiveGroup(groupId)
    if (!hasSwitched) return
    // toast({ title: `Switched to ‘${props.title || "Untitled set"}’ icon set` });

    setTimeout(() => {
      document.querySelector(`#sets`)?.scrollIntoView()
    }, 0)
  }

  return (
    <article
      className="group/set grid gap-3"
      key={props.id}
      aria-label={props.isHeader ? 'Current set' : 'Icon set'}
    >
      <Header
        id={props.id}
        title={props.title}
        updateGroupTitle={updateGroupTitle}
        isCurrent={props.isCurrent ?? false}
        isLarge={props.isHeader ?? false}
        createdAt={props.createdAt}
      />
      {Boolean(hasIcons) && (
        <div className="group relative @container">
          <div className="@4xl:grid-cols-15 pointer-events-none grid grid-cols-2 p-3.5 @xs:grid-cols-4 @xl:grid-cols-5 @2xl:grid-cols-6 @3xl:grid-cols-12">
            <div className="z-10 grid place-content-center text-center">
              <div className="-mb-1 block text-lg">{iconCount}</div>
              <div className="text-md">
                {iconCount === 1 ? 'icon' : 'icons'}
              </div>
            </div>
            {/* <Guides /> */}

            {/* {props.icons.map(([id, data], i) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={`${i}-${id}`}
              type="button"
              className="pointer-events-auto relative z-10"
              onClick={() => {
                setActiveIcon(props.id, data.title, id);
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: data.svg.output }}
                className="relative z-10 rounded border border-transparent p-5 hover:border-[--text-muted] hover:shadow-sm"
              />
              <Guides />
            </button>
          ))} */}

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
              <div className="-mb-1 block text-lg">+{hiddenCount}</div>
            )}
            {/* <button
                type="button"
                className="pointer-events-auto"
                onClick={() => handleAddEditor(g.id, "")}
              >
                Add icon
              </button> */}
          </div>
          {!props.isHeader && (
            <SheetClose asChild>
              <button
                type="button"
                onClick={() => {
                  handleSelectGroup(props.id)
                }}
                className={tw(
                  'absolute inset-0 z-0 cursor-pointer rounded-lg border opacity-0',
                  'hover:opacity-50 group-focus-within:opacity-50 group-hover:opacity-50',
                  props.isCurrent && 'opacity-50'
                )}
              />
            </SheetClose>
          )}
        </div>
      )}
      {!props.isHeader && Boolean(!hasIcons) && (
        <div className="relative z-10 grid place-content-center p-10 text-center">
          <div className="text-sm">No icons yet</div>
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => {
                handleSelectGroup(props.id)
              }}
              className={tw(
                'absolute inset-0 z-0 cursor-pointer rounded-lg border border-dashed',
                props.isCurrent && 'opacity-50'
              )}
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
  const { setEditorOrderByIds } = useAppActions()
  const { setActiveGroup } = useAppActions()
  const sortableContextId = useId()
  const sensors = useSensors(
    // Allow onClick events alongside dragging
    // https://github.com/clauderic/dnd-kit/issues/591#issuecomment-1017050816
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const setActiveIcon = (
    groupId: string,
    // title: string,
    // editorId: string,
    index: number
  ) => {
    setActiveGroup(groupId)

    props.virtualListRef.current?.scrollToIndex({
      index,
      align: 'center',
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
          setActiveIcon(props.id, i)
        }}
      >
        <div className="grid">
          <div
            dangerouslySetInnerHTML={{ __html: data.svg.output }}
            className={cn(
              'relative z-10 rounded border border-transparent p-5 hover:border-[--text-muted] hover:shadow-sm',
              { 'border-red-800': hasError }
            )}
          />
          {Boolean(hasError) && (
            <AlertOctagon className="absolute -mb-3 self-end justify-self-center text-red-800" />
          )}
        </div>
        {/* <Guides /> */}
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
      className="relative z-10 rounded border border-transparent p-3 hover:border-[--text-muted] hover:shadow-sm"
    />
  ))
