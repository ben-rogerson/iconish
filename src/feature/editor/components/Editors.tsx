import type { RefObject } from "react";
import { memo, useEffect, useState } from "react";
import type { VirtuosoHandle } from "react-virtuoso";
import { Editor } from "@/feature/editor/components/Editor";
import { EditorList } from "@/feature/editor/components/EditorList";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { cn, tw } from "@/lib/utils";
import { Preview } from "@/feature/editor/components/Preview";

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
          "bg-[--line-border-dark] h-0.5 rounded grid place-content-center",
          { "invisible group-hover/add:visible": !isVisible }
        )}
      >
        <div className="bg-[--page-bg] px-5 text-[--line-border] text-xl">
          Add icon
        </div>
      </div>
    </button>
  );
});

/**
 * Update the list when the hash changes.
 * This is a hack to get around the fact that getEditors is not reactive.
 */
const useEditorsRender = () => {
  const { getEditors } = useAppActions();
  const hash = useAppStore((s) => s.updateListHash);
  const [editors, setEditors] = useState(getEditors());

  useEffect(() => {
    setEditors(getEditors());
  }, [hash, getEditors]);
  return editors;
};

const Editors = (props: { virtualListRef: RefObject<VirtuosoHandle> }) => {
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

  const editorCount = getEditors.filter(
    (e) => e[1].svg.output !== "" && e[1].svg.output.includes("<svg")
  ).length;

  return (
    <EditorList virtualListRef={props.virtualListRef}>
      {getEditors.map(([editorId, data], index) => {
        const showOutput =
          data.svg.output !== "" && data.svg.output.includes("<svg");
        const showAdd = editorCount > 0;
        return (
          <article
            id={editorId}
            key={editorId}
            className={cn("group/editor relative pt-6 pb-14")}
            aria-label={showOutput ? "editor" : "preview"}
          >
            {Boolean(showAdd) && index === 0 && (
              <Add
                onClick={() => {
                  addEditorAtIndex(index);
                }}
                isTop
              />
            )}
            {showOutput ? (
              <Editor key={editorId} id={editorId} data={data} />
            ) : (
              <Preview id={editorId} showRemove={getEditors.length > 1} />
            )}
            {Boolean(showAdd) && (
              <Add
                onClick={() => {
                  addEditorAtIndex(index + 1);
                }}
              />
            )}
          </article>
        );
      })}
    </EditorList>
  );
};

export { Editors };
