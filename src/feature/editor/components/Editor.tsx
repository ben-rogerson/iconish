import { Button } from "@/components/Button";
import { AddEditor } from "@/components/Detail";
import { RemoveButton } from "@/components/RemoveButton";
import { Alerts } from "@/feature/editor/components/Alerts";
import { Title } from "@/feature/editor/components/Title";
import { useEditorWrap } from "@/feature/editor/editor.hooks";
import { doSanitizeSvg } from "@/feature/svg/svgTasks";
import { useAppActions } from "@/hooks/appState";
import { iconBarrier } from "@/lib/icons";
import { calculateSizeSavings } from "@/utils/calculateSizeSavings";
import { type EditorState } from "@/utils/types";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";
import { useCopyToClipboard } from "usehooks-ts";

type EditorProps = {
  id: string;
  data: EditorState[1];
};

const Editor = (props: EditorProps) => {
  const { removeEditor, updateEditorSvg } = useAppActions();
  const [hasWordWrapIn, WordWrapIn] = useEditorWrap(false);
  const [hasWordWrapOut, WordWrapOut] = useEditorWrap(true);
  const [copied, copy] = useCopyToClipboard();
  const sanitizedSvg = useMemo(
    () => doSanitizeSvg(props.data.view?.doc ?? ""),
    [props.data.view?.doc]
  );
  const sized = useMemo(
    () =>
      calculateSizeSavings(props.data.view?.doc ?? "", props.data.svg.output),
    [props.data.view?.doc, props.data.svg.output]
  );

  const showOutput =
    props.data.svg.output !== "" && props.data.svg.output.includes("<svg");

  const handleOnChange = (value: string) => {
    updateEditorSvg(props.id, value);
  };

  return (
    <div className="group/editor relative grid gap-3">
      <div className="grid grid-cols-2">
        <div className="absolute right-0 top-3">
          <RemoveButton
            onClick={() => {
              removeEditor(props.id);
            }}
          />
        </div>
        <Title id={props.id} title={props.data.title} />
      </div>
      <div className="grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] md:grid">
        <div className="relative rounded-l border bg-[--page-bg-dark] p-[25%]">
          {Boolean(showOutput && sanitizedSvg) && (
            <>
              <div dangerouslySetInnerHTML={{ __html: sanitizedSvg }} />
              <Alerts svg={props.data.view?.doc ?? ""} />
              <div className="absolute left-2 top-2 hidden text-xs text-[--text-muted] group-focus-within/editor:block group-hover/editor:block">
                {sized.before}
              </div>
            </>
          )}
          {!showOutput && (
            <div className="grid place-items-center h-full">{iconBarrier}</div>
          )}
          {Boolean(showOutput) && (
            <div className="absolute -bottom-px left-1/2 top-full h-[50px] w-px origin-top-left bg-[--line-border] after:absolute after:bottom-px after:h-2 after:w-2 after:-translate-x-[50%] after:-rotate-45 after:border-b after:border-l after:border-b-[--line-border] after:border-l-[--line-border]" />
          )}
        </div>
        <div className="relative rounded-r border border-l-0 p-6">
          {(props.data.view?.doc.length ?? 0) > 30 && (
            <div className="absolute right-6 top-0 -mt-2.5 flex justify-end bg-[--page-bg] px-1.5 group-focus-within/editor:block group-hover/editor:block md:hidden">
              <WordWrapIn />
            </div>
          )}
          {showOutput ? (
            <CodeMirror
              extensions={[
                javascript({ jsx: true }),
                [...[hasWordWrapIn ? EditorView.lineWrapping : []]],
              ]}
              onChange={handleOnChange}
              theme={vscodeDark}
              value={props.data.view?.doc ?? ""}
            />
          ) : (
            <AddEditor editorId={props.id} />
          )}
        </div>
      </div>
      {Boolean(showOutput) && (
        <div className="grid-cols-[minmax(0,_0.25fr)_minmax(0,_1fr)] md:grid">
          <div className="relative rounded-l border bg-[--page-bg-dark] p-[25%]">
            <div dangerouslySetInnerHTML={{ __html: props.data.svg.output }} />
            <div className="absolute left-2 top-2 hidden text-xs text-[--text-muted] group-focus-within/editor:block group-hover/editor:block">
              {sized.after}
            </div>
          </div>
          <div className="relative rounded-r border border-l-0 p-6">
            {props.data.svg.output.length > 30 && (
              <div className="absolute right-6 top-0 -mt-2.5 flex justify-end bg-[--page-bg] px-1.5 group-focus-within/editor:block group-hover/editor:block md:hidden">
                <WordWrapOut />
              </div>
            )}
            <CodeMirror
              extensions={[
                javascript({ jsx: true }),
                EditorView.editable.of(false),
                [...[hasWordWrapOut ? EditorView.lineWrapping : []]],
              ]}
              theme={vscodeDark}
              value={props.data.svg.output}
              // onUpdate={handleOnUpdateOut}
            />
            <div className="text-md absolute -bottom-3 left-0 flex w-full justify-between px-6 uppercase">
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    copy(props.data.svg.output).catch(() => null);
                  }}
                >
                  <span className="uppercase text-[--text-muted]">
                    {copied ? "Copied" : "Copy SVG"}
                  </span>
                </Button>
              </div>
              <div className="-ml-2 bg-[--page-bg] px-2 text-[--text-muted]">
                Minified {sized.savingsPercent} &middot; Saved {sized.savings}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Editor };
