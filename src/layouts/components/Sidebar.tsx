import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppStore } from "@/hooks/appState";

export const WithMobileSidebar = ({
  children,
  sidebarContent: SidebarContent,
}: {
  children: React.ReactNode;
  sidebarContent: () => JSX.Element;
}) => {
  const { groups } = useAppStore((s) => s);
  return (
    <>
      <Sheet>
        <SheetTrigger
          className="fixed top-7 right-5"
          aria-label="View icon sets"
        >
          <MenuIcon size={24} />
          <div className="text-xs absolute -right-1.5 -top-1.5 rounded-full bg-[--page-bg] px-1">
            {groups.length}
          </div>
        </SheetTrigger>
        <SheetContent side="right" className="overflow-y-auto">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      {children}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const WithDesktopSidebar = ({
  children,
  sidebarContent: SidebarContent,
}: {
  children: React.ReactNode;
  sidebarContent: () => JSX.Element;
}) => {
  return (
    // style used from here -> https://github.com/shadcn-ui/ui/blob/1cf5fad881b1da8f96923b7ad81d22d0aa3574b9/apps/www/app/docs/layout.tsx#L12
    <div className="container h-screen flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="fixed top-14 z-30 -ml-2 hidden h-screen w-full shrink-0 border-r md:sticky md:block">
        <div className="h-full py-6 pl-8 pr-6 lg:py-8">
          <SidebarContent />
        </div>
      </aside>
      {children}
    </div>
  );
};

export const Sidebar = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  sidebarContent: () => JSX.Element;
}) => {
  return (
    <WithDesktopSidebar {...props}>
      <WithMobileSidebar {...props}>{children}</WithMobileSidebar>
    </WithDesktopSidebar>
  );
};
