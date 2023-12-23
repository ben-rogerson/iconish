import { plusIcon } from "@/lib/icons";
import { GroupSet } from "@/components/GroupSet";
import { useAppActions, useAppStore } from "@/hooks/appState";
import { Button } from "@/components/ui/button";

const List = () => {
  const { addGroup, getGroups } = useAppActions();
  const activeGroupId = useAppStore((s) => s.activeGroupId);

  const groups = getGroups();

  const icons = groups.map((g) => {
    const iconsAll = g.editors.filter(
      ([, data]) =>
        data.svg.output &&
        data.svg.output !== '<html xmlns="http://www.w3.org/1999/xhtml"/>'
    );
    const count = iconsAll.length;
    const iconsLimit = iconsAll.slice(0, 10);
    return { ...g, count, icons: iconsLimit };
  });

  return (
    <div id="sets" className="grid gap-9">
      <h2 className="text-xl pt-4">Icon sets</h2>

      <div>
        <Button
          onClick={() => {
            addGroup();
          }}
          className="w-full"
          variant="outline"
          size="icon"
          // className="flex items-center gap-2 py-10 text-[--text-muted] hover:text-[--text]"
        >
          {plusIcon} Add a set
        </Button>
        {/* <Button> */}
        {/* <Mail className="mr-2 h-4 w-4" /> Login with Email */}
        {/* </Button> */}
      </div>

      {groups.length > 0 &&
        icons.map((g) => (
          <GroupSet
            key={g.id}
            id={g.id}
            title={g.title}
            isHeader={false}
            createdAt={g.createdAt}
            icons={g.icons}
            count={g.count}
            isCurrent={g.id === activeGroupId}
          />
        ))}
    </div>
  );
};

export { List };
