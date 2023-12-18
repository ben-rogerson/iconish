import { setIcon } from "@/lib/icons";
import { GroupSet } from "@/components/GroupSet";
import { useAppActions, useAppStore } from "@/hooks/appState";

const List = () => {
  const { addGroup } = useAppActions();
  const groups = useAppStore((s) => s.groups);
  const activeGroupId = useAppStore((s) => s.activeGroupId);

  const handleAddSet = () => {
    addGroup();
  };

  // const handleAddEditor = (groupId: string, input: string) => {
  //   const editor = appState?.addEditor(input, "", groupId);
  //   appState?.setActiveGroup(groupId, { scroll: false });

  //   editor?.scrollTo();
  // };

  // const handleUpdateGroupTitle = (title: string, groupId: string) => {
  //   appState?.updateGroupTitle(title, groupId);
  // };

  // const handleSelectGroup = (groupId: string) => {
  //   appState?.setActiveGroup(groupId, { scroll: true });
  // };

  // const handleRemoveGroup = (groupId: string) => {
  //   appState?.removeGroup(groupId);
  // };

  // const setActiveIcon = (groupId: string, editorId: string) => {
  //   appState?.setActiveGroup(groupId, { scroll: false });

  //   setTimeout(() => {
  //     document
  //       .querySelector(`#${editorId}`)
  //       ?.scrollIntoView({ behavior: "smooth" });
  //   }, 0);
  // };

  const showGroups = groups.length > 0;

  const icons = groups.map((g) => {
    const iconsAll = g.editors.filter(
      ([, data]) =>
        data.svg.output &&
        data.svg.output !== '<html xmlns="http://www.w3.org/1999/xhtml"/>'
    );
    const count = iconsAll.length;
    const iconsLimit = iconsAll.slice(0, 5);
    return { ...g, count, icons: iconsLimit };
  });

  return (
    <div id="sets" className="grid gap-9">
      {/* <div className="flex justify-end gap-10">
        <div>Export</div>
        <div>Export all SVGs</div>
      </div> */}
      {!!showGroups &&
        icons.map((g) => (
          <GroupSet
            key={g.id}
            id={g.id}
            title={g.title}
            createdAt={g.createdAt}
            icons={g.icons}
            count={g.count}
            isCurrent={g.id === activeGroupId}
          />
        ))}
      <div>
        <button
          type="button"
          onClick={handleAddSet}
          className="flex items-center gap-2 py-10 text-[--text-muted] hover:text-[--text]"
        >
          {setIcon} Add a set
        </button>
      </div>
    </div>
  );
};

export { List };
