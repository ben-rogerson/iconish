import type { RefObject } from "react";
import { memo, useEffect, useState } from "react";

import { Editor } from "@/feature/editor/components/Editor";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { cn, tw } from "@/lib/utils";
import { EditorList } from "@/components/EditorList";
import type { VirtuosoHandle } from "react-virtuoso";
import { run } from "@/utils/run";

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

  return (
    <EditorList virtualListRef={props.virtualListRef}>
      {getEditors.map(([editorId, data], index) => {
        const showOutput =
          data.svg.output !== "" && data.svg.output.includes("<svg");
        return (
          <article
            id={editorId}
            key={editorId}
            className="group/editor relative pt-6 pb-14"
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
            {/* {JSON.stringify(data.svg.log)} */}
            {run(() => {
              return (
                <ul className="p-10">
                  {(data.svg.log ?? [])
                    .filter((l) => !l.type.startsWith("data."))
                    .map((l, i) => {
                      return (
                        <li
                          // eslint-disable-next-line react/no-array-index-key
                          key={i}
                          className={cn({
                            "text-red-500": l.type === "error",
                            "text-green-500": l.type === "success",
                            "text-gray-500": l.type === "debug",
                            "text-[--text-normal]": l.type === "info",
                          })}
                        >
                          <div className="grid grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] gap-2">
                            <div className="text-right">-</div>
                            <div>
                              {l.msg}{" "}
                              <span className="text-xs opacity-50">
                                {l.type}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              );
            })}
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
