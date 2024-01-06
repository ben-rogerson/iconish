import type { MouseEvent, ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = (props: {
  id: string;
  children: ReactNode;
  handleOnClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      className="group relative cursor-auto pointer-events-auto"
      onClick={props.handleOnClick}
      {...attributes}
      {...listeners}
    >
      <span id={props.id}>{props.children}</span>
    </button>
  );
};

export { SortableItem };
