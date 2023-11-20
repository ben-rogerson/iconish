import { crossIcon } from "@/lib/icons";
import { tw } from "@/lib/utils";
import { type FunctionComponent, type MouseEventHandler } from "react";

export const RemoveButton: FunctionComponent<{
  onClick: MouseEventHandler<HTMLButtonElement>;
}> = (props) => {
  return (
    <button
      onClick={props.onClick}
      className={tw([
        "group/button",
        "group-hover/editor:block group-hover/set:block",
        "hidden h-6 w-6 p-2 place-items-center relative",
      ])}
    >
      <div
        className={tw([
          "group-hover/button:bg-[var(--button-bg-hover)]",
          "absolute inset-0 rounded-full bg-transparent",
        ])}
      />
      <div
        className={tw([
          "hover:text-[--button-text-hover]",
          "pointer-events-none relative z-0 text-md",
        ])}
      >
        {crossIcon}
      </div>
    </button>
  );
};
