import { useAppActions } from "@/hooks/appState";
import { tw } from "@/lib/utils";
import { type FunctionComponent } from "react";
import { type Group } from "@/utils/types";
import { intlFormatDistance } from "date-fns";
import { Copy, Layers, MoreVertical, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCopySvgsToClipboard } from "@/feature/svg/svg.hooks";
import { useToast } from "@/components/ui/use-toast";

export function Menu(props: {
  title: string;
  groupId: string;
  createdAt: number;
}) {
  const { removeGroup } = useAppActions();
  const { toast } = useToast();
  const copyAll = useCopySvgsToClipboard(props.groupId);

  const handleRemoveGroup = () => {
    const { hasRemoved } = removeGroup(props.groupId);
    toast({
      title: hasRemoved
        ? `Deleted ‘${props.title || "Untitled set"}’ icon set`
        : "Add another set first, then you can delete this one",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button">
          <MoreVertical />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          Icon set
          {!!props.createdAt && (
            <>
              <br />
              Added {relativeTime(props.createdAt)}
            </>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={copyAll.copy}>
            <Copy className="mr-2 h-4 w-4" />
            <span>
              Copy optimized SVGs{copyAll.hasCopied ? "All copied" : ""}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Layers className="mr-2 h-4 w-4" />
            <span>Copy sprite sheet</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleRemoveGroup}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete set</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// const Menu = () => {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger>Open</DropdownMenuTrigger>
//       <DropdownMenuContent>
//         <DropdownMenuLabel>My Account</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem>Profile</DropdownMenuItem>
//         <DropdownMenuItem>Billing</DropdownMenuItem>
//         <DropdownMenuItem>Team</DropdownMenuItem>
//         <DropdownMenuItem>Subscription</DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

const Guides = () => {
  return (
    <div className={tw("pointer-events-none absolute top-1/2 w-[3440px]")}>
      <div
        className={tw("absolute mt-4 h-px w-full bg-[--line-border-dark]")}
      />
      <div
        className={tw("absolute -mt-4 h-px w-full bg-[--line-border-dark]")}
      />
    </div>
  );
};

// const Fade = () => {
//   return (
//     <div className="absolute inset-0 bg-gradient-to-r from-[--page-bg] to-transparent w-36" />
//   );
// };

const relativeTime = (date: number) => {
  const timeString = intlFormatDistance(date, new Date());
  return timeString;
};

const Header: FunctionComponent<{
  id: string;
  title: string;
  isCurrent: boolean;
  isLarge: boolean;
  createdAt: number;
  updateGroupTitle: (groupId: string, title: string) => void;
}> = (props) => {
  return (
    <header
      className={tw("relative flex justify-between", props.isLarge && "pb-3")}
    >
      <div className="grid w-full gap-2">
        <input
          type="text"
          defaultValue={props.title}
          placeholder={props.title ? "" : "Untitled set…"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            props.updateGroupTitle(props.id, e.currentTarget.value);
          }}
          className={tw(
            `w-[inherit] bg-transparent text-xl text-[--text-muted]`,
            `focus:text-[--text-normal] focus:text-[--text] focus:outline-none`,
            `placeholder:italic placeholder-[--text-muted]`,
            props.isLarge && `text-5xl tracking-tight`
          )}
        />
      </div>
      {/* <div className="flex justify-end gap-10"> */}
      {/* <div>View spritesheet</div> */}
      <div className="flex">
        <Menu
          groupId={props.id}
          createdAt={props.createdAt}
          title={props.title}
        />
        {/* <RemoveButton onClick={() => props.removeGroup(props.id)} /> */}
      </div>
      {/* </div> */}
    </header>
  );
};

type GroupSetBlock = {
  id: Group["id"];
  title: Group["title"];
  createdAt: Group["createdAt"];
  icons: Group["editors"];
  count?: number;
  isCurrent?: boolean;
  isHeader?: boolean;
};

export const GroupSet = (props: GroupSetBlock) => {
  const { updateGroupTitle, setActiveGroup } = useAppActions();
  const { toast } = useToast();

  const iconCount = props.count ?? props.icons.length;
  const hasIcons = props.icons.length > 0;
  const hiddenCount =
    !props.isHeader && props.count && props.count > props.icons.length
      ? props.count - props.icons.length
      : 0;

  const handleUpdateGroupTitle = (groupId: string, title: string) => {
    updateGroupTitle(groupId, title);
  };

  const handleSelectGroup = (groupId: string) => {
    const { hasSwitched } = setActiveGroup(groupId);
    if (!hasSwitched) return;
    toast({ title: `Switched to ‘${props.title || "Untitled set"}’ icon set` });

    setTimeout(() => {
      document.querySelector(`#sets`)?.scrollIntoView();
    }, 0);
  };

  const setActiveIcon = (groupId: string, title: string, editorId: string) => {
    const { hasSwitched } = setActiveGroup(groupId);

    hasSwitched &&
      toast({
        title: `Showing ‘${title || "Untitled icon"}’`,
        description: `In the ‘${props.title || "Untitled set"}’ icon set`,
      });

    setTimeout(() => {
      document
        .querySelector(`#${editorId}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  return (
    <article
      className="group/set grid gap-3 overflow-hidden"
      id="header"
      key={props.id}
    >
      <Header
        id={props.id}
        title={props.title}
        updateGroupTitle={handleUpdateGroupTitle}
        isCurrent={props.isCurrent ?? false}
        isLarge={props.isHeader ?? false}
        createdAt={props.createdAt}
      />
      <div className="group relative">
        <div className="pointer-events-none grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12">
          <div className="z-10 grid place-content-center text-center bg-[--page-bg]">
            <div className="-mb-1 block text-lg">
              {hasIcons ? iconCount : "no"}
            </div>
            <div className="text-md">{iconCount === 1 ? "icon" : "icons"}</div>
          </div>
          <Guides />

          {props.icons.map(([id, data], i) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={`${i}-${id}`}
              type="button"
              className="pointer-events-auto relative z-10"
              onClick={() => {
                setActiveIcon(props.id, data.title, id);
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: data.svg.output }}
                className="relative z-10 rounded border border-transparent p-5 hover:border-[--text-muted] hover:shadow-sm"
              />
              <Guides />
            </button>
          ))}

          {hiddenCount > 0 && (
            <div className="-mb-1 block text-lg">+{hiddenCount}</div>
          )}
          {/* <button
                type="button"
                className="pointer-events-auto"
                onClick={() => handleAddEditor(g.id, "")}
              >
                Add icon
              </button> */}
        </div>
        {!props.isHeader && (
          <button
            type="button"
            onClick={() => {
              handleSelectGroup(props.id);
            }}
            className={tw(
              "absolute inset-0 z-0 cursor-pointer rounded-lg opacity-0",
              "hover:opacity-50 group-focus-within:opacity-50 group-hover:opacity-50",
              props.isCurrent && "opacity-50"
            )}
          />
        )}
      </div>
    </article>
  );
};
