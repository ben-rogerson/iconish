import { memo, useEffect, useState } from "react";

import { Editor } from "@/feature/editor/components/Editor";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { cn, tw } from "@/lib/utils";
import { EditorList } from "@/components/EditorList";

const Add = memo(function Memo(props: {
  onClick: () => void;
  isTop?: boolean;
  isVisible?: boolean;
}) {
  const isVisible = props.isVisible ?? false;
  return (
    <button
      className={tw(
        "py-10 w-full block group/add absolute",
        props.isTop ? "-top-16" : "-bottom-34"
      )}
      type="button"
      onClick={props.onClick}
      aria-label="Add SVG"
    >
      <div
        className={cn(
          "bg-[--line-border-dark] h-0.5 rounded text-4xl grid place-content-center",
          { "invisible group-hover/add:visible": !isVisible }
        )}
      >
        <div className="bg-[--page-bg] px-5 text-[--line-border]">+</div>
      </div>
    </button>
  );
});

/**
 * Update the group list when the hash changes.
 * This is a hack to get around the fact that getGroup is not reactive.
 */
const useEditorsRender = () => {
  const { getGroup } = useAppActions();
  // console.log({ getGroup: getGroup() });
  const hash = useAppStore((s) => s.updateListHash);
  const [group, setGroup] = useState(getGroup());

  useEffect(() => {
    setGroup(getGroup());
  }, [hash, getGroup]);
  return group?.editors ?? [];
};

const Editors = () => {
  const { addEditorAtIndex } = useAppActions();
  const getEditors = useEditorsRender();

  if (getEditors.length === 0)
    return (
      <div className="relative">
        <Add
          onClick={() => {
            addEditorAtIndex(0);
          }}
          isVisible
          isTop
        />
      </div>
    );

  return (
    <EditorList>
      {getEditors.map(([editorId, data], index) => {
        const showOutput =
          data.svg.output !== "" && data.svg.output.includes("<svg");
        return (
          <article
            id={editorId}
            key={editorId}
            className="group/editor relative"
            aria-label={showOutput ? "editor" : "preview"}
          >
            {index === 0 && (
              <Add
                onClick={() => {
                  addEditorAtIndex(index);
                }}
                isTop
              />
            )}
            <Editor
              key={editorId}
              id={editorId}
              data={data}
              showOutput={showOutput}
            />
            <Add
              onClick={() => {
                addEditorAtIndex(index + 1);
              }}
            />
          </article>
        );
      })}
    </EditorList>
  );
};

export { Editors };
