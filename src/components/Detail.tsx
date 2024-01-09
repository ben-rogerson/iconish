import { useRef } from "react";
import { Editors } from "@/feature/editor/components/Editors";
import { useAppActions } from "@/hooks/appState";
import { GroupSet } from "@/components/GroupSet";
import { ConfigPanel } from "@/feature/config/components/ConfigPanel";
import { type VirtuosoHandle } from "react-virtuoso";

/**
 * Update the group list when the hash changes.
 * This is a hack to get around the fact that getGroup is not reactive.
 */
// const useGroupRender = () => {
//   const { getGroup } = useAppActions();
//   const hash = useAppStore((s) => s.updateListHash);
//   const [group, setGroup] = useState(getGroup());
//   useEffect(() => {
//     setGroup(getGroup());
//   }, [hash, getGroup]);
//   return group;
// };

const Detail = () => {
  const { getGroup } = useAppActions();
  const group = getGroup();
  // TODO: Move this ref to a provider?
  const virtualListRef = useRef<VirtuosoHandle>(null);

  const activeEditors =
    group?.editors.filter(
      ([, data]) =>
        data.svg.output &&
        data.svg.output !== '<html xmlns="http://www.w3.org/1999/xhtml"/>'
    ) ?? [];

  return (
    <div className="grid gap-20">
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
            // eslint-disable-next-line react/jsx-no-leaked-render
            icons={activeEditors.length > 1 ? activeEditors : []}
            virtualListRef={virtualListRef}
            isHeader
          />
        )}
        <Editors virtualListRef={virtualListRef} />
      </div>
    </div>
  );
};

export { Detail };
