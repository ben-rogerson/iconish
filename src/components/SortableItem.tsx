import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// import { Item } from "./Item";

const icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

const SortableItem = (props: { id: string; children: ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group relative cursor-auto bg-[--page-bg]"
      data-testid="sortable-item"
    >
      <button
        {...listeners}
        className="absolute -left-8 top-5 hidden text-4xl text-[--drag-indicator-text] hover:text-[--drag-indicator-text-active] group-hover:block"
        type="button"
      >
        {icon}
        <div className="absolute inset-0 h-10 w-10 bg-transparent" />
      </button>
      <div id={props.id}>{props.children}</div>
    </div>
  );
};

export { SortableItem };
