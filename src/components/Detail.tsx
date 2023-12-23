import { forwardRef, memo, useEffect, useRef, useState } from "react";
import { Editors } from "@/components/Editors";
import {
  bugIcon,
  bugItemDisplay,
  flyaway,
  flyawayIconDisplay,
  cookie,
  cookieIconDisplay,
} from "@/lib/icons";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { GroupSet } from "@/components/GroupSet";
import { ConfigPanel } from "@/feature/config/components/ConfigPanel";
import { Upload } from "@/components/Upload";
import { type VirtuosoHandle } from "react-virtuoso";

const AddIconInput = forwardRef<
  HTMLInputElement,
  {
    onEnterKey: (value: string) => void;
    onUpload: (value: Set<[string, string]>) => void;
  }
>((props, ref) => {
  return (
    <div className="flex items-center gap-1">
      <Upload onUpload={props.onUpload} />
      <div className="px-8 text-[150%] text-[--text-muted]">/</div>
      <input
        ref={ref}
        type="text"
        className="w-full bg-transparent py-3 text-[170%] text-[--input-text] placeholder-[var(--text-muted)] focus:outline-0"
        placeholder="Paste svg&hellip;"
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          props.onEnterKey(e.currentTarget.value);
        }}
      />
    </div>
  );
});

AddIconInput.displayName = "AddIconInput";

const examples = [
  ["bug", { code: bugIcon, display: bugItemDisplay }],
  ["burd", { code: flyaway, display: flyawayIconDisplay }],
  ["cookie", { code: cookie, display: cookieIconDisplay }],
] as const;

type ExampleItem = {
  onClick: () => void;
  svg: JSX.Element;
  title: string;
};

function ExampleItem(props: ExampleItem) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="inline-flex gap-1 p-4"
    >
      {props.svg}
      <span>{props.title}</span>
    </button>
  );
}

export const AddEditor = memo(function AddEditor(props: { editorId: string }) {
  const { updateEditorSvg, addEditor } = useAppActions();

  const ref = useRef<HTMLInputElement>(null);
  // const { toast } = useToast();

  const handleUpdateEditor = (value: string) => {
    updateEditorSvg(props.editorId, value);
  };

  const handleOnUpload = (values: Set<[string, string]>) => {
    [...values].forEach(([fileName, svgCode]) => {
      addEditor(svgCode, fileName);
    });
  };

  return (
    <div className="flex items-center justify-center">
      {/* <div className="text-[600%] text-[--text-muted]">{plusIcon}</div> */}
      <div className="w-full md:px-20 md:py-4">
        <div className="grid gap-3">
          <AddIconInput
            ref={ref}
            onEnterKey={handleUpdateEditor}
            onUpload={handleOnUpload}
          />
          <div className="inline-flex items-center">
            <div className="mr-3">Or add a</div>
            {examples.map((item) => (
              <ExampleItem
                onClick={() => {
                  handleUpdateEditor(item[1].code);
                }}
                key={item[0]}
                svg={item[1].display}
                title={item[0]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// const ConfigPanelNoSSR = dynamic(
//   () =>
//     import("@/feature/config/components/ConfigPanel").then(
//       (mod) => mod.ConfigPanel
//     ),
//   { ssr: false }
// );

/**
 * Update the group list when the hash changes.
 * This is a hack to get around the fact that getGroup is not reactive.
 */
const useGroupRender = () => {
  const { getGroup } = useAppActions();
  const hash = useAppStore((s) => s.updateListHash);
  const [group, setGroup] = useState(getGroup());
  useEffect(() => {
    setGroup(getGroup());
  }, [hash, getGroup]);
  return group;
};

const Detail = () => {
  const group = useGroupRender();
  // TODO: Move this ref to a provider
  const virtualListRef = useRef<VirtuosoHandle>(null);

  return (
    <>
      <div
        className="sticky top-0 z-50 flex items-center gap-6 border-b border-b-[--line-border] bg-[--page-bg] py-3"
        role="toolbar"
      >
        <ConfigPanel />
      </div>
      <div className="grid gap-16">
        {!!group && (
          <GroupSet
            id={group.id}
            title={group.title}
            createdAt={group.createdAt}
            icons={group.editors.filter(
              ([, data]) =>
                data.svg.output &&
                data.svg.output !==
                  '<html xmlns="http://www.w3.org/1999/xhtml"/>'
            )}
            virtualListRef={virtualListRef}
            isHeader
          />
        )}
        <Editors virtualListRef={virtualListRef} />
      </div>
    </>
  );
};

export { Detail };
