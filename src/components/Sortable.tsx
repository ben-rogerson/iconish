import { useCallback, useEffect, useId, useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { Editor } from "@/feature/editor/components/Editor";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { tw } from "@/lib/utils";

const Add = (props: { onClick: () => void; isTop?: boolean }) => {
  return (
    <button
      className={tw(
        "py-10 w-full block group/add absolute",
        props.isTop ? "-top-16" : "-bottom-34"
      )}
      type="button"
      onClick={props.onClick}
    >
      <div className="bg-[--line-border-dark] invisible group-hover/add:visible h-0.5 rounded text-4xl grid place-content-center">
        <div className="bg-[--page-bg] px-5 text-[--line-border]">+</div>
      </div>
    </button>
  );
};

/**
 * Update the group list when the hash changes.
 * This is a hack to get around the fact that getGroup is not reactive.
 */
const useEditorsRender = () => {
  const { getGroup } = useAppActions();
  const hash = useAppStore((s) => s.updateListHash);
  const [group, setGroup] = useState(getGroup());
  useEffect(() => {
    setGroup(getGroup());
  }, [hash, getGroup]);
  return group?.editors ?? [];
};

const Sortable = () => {
  const { addEditorAtIndex, updateOrder } = useAppActions();

  const id = useId();
  const sensors = useSensors(
    // touchSensor,
    useSensor(MouseSensor)
    // useSensor(PointerSensor),
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates,
    // })
  );

  // console.log({ sortable: "rerender" });

  const getEditors = useEditorsRender();

  const componentList: JSX.Element[] = [];
  const idList: string[] = [];
  getEditors.forEach(([editorId, data], index) => {
    idList.push(editorId);
    componentList.push(
      <SortableItem key={editorId} id={editorId}>
        <div className="relative">
          {index === 0 && (
            <Add
              onClick={() => {
                addEditorAtIndex(index);
              }}
              isTop
            />
          )}
          <Editor key={editorId} id={editorId} data={data} />
          <Add
            onClick={() => {
              addEditorAtIndex(index + 1);
            }}
          />
        </div>
      </SortableItem>
    );
  });

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      updateOrder(active.id as string, over.id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={idList} strategy={verticalListSortingStrategy}>
        {componentList}
      </SortableContext>
      {/* <DragOverlay>{activeId ? <Item id={activeId} /> : null}</DragOverlay> */}
    </DndContext>
  );
};

// const SortableCached = memo(Sortable);
export { Sortable };
