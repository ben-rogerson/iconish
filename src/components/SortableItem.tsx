import type { MouseEvent, ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// const icon = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="9" cy="12" r="1" />
//     <circle cx="9" cy="5" r="1" />
//     <circle cx="9" cy="19" r="1" />
//     <circle cx="15" cy="12" r="1" />
//     <circle cx="15" cy="5" r="1" />
//     <circle cx="15" cy="19" r="1" />
//   </svg>
// );

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
