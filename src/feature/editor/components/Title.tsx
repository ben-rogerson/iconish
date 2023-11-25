import { memo } from "react";
import { useAppActions } from "@/hooks/appState";
import { tw } from "@/lib/utils";

const Title = (props: { title: string; id: string; svgId?: string }) => {
  const { updateEditorTitle } = useAppActions();

  const placeholder =
    (!props.title && props.svgId?.toLowerCase()) || "Untitled icon…";

  return (
    <div className="relative inline-block border-0 border-b border-b-transparent text-3xl">
      <input
        type="text"
        spellCheck={false}
        defaultValue={(props.title !== "" ? props.title : props.svgId) ?? ""}
        placeholder={placeholder}
        onChange={(e) => {
          updateEditorTitle(props.id, e.currentTarget.value);
        }}
        className={tw([
          "w-full bg-transparent py-3 tracking-tight text-[--input-text-muted] placeholder-[var(--text-muted)] hover:text-[--input-hover] focus:text-[--input-hover] focus:outline-0",
          "placeholder:italic",
        ])}
      />
    </div>
  );
};

const CachedTitle = memo(Title);

export { CachedTitle as Title };
