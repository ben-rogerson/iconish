"use client";
import { LayoutDefault } from "@/components/LayoutDefault";
import { Detail } from "@/components/Detail";
import { List } from "@/components/List";
import { useAppStore } from "@/hooks/appState";
import { WithMobileSidebar } from "@/components/Sidebar";

const Home = () => {
  const hasHydrated = useAppStore((s) => s._hasHydrated);

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <WithMobileSidebar sidebarContent={List}>
      <div>
        <LayoutDefault>
          <div className="grid gap-y-20">
            <Detail />
          </div>
        </LayoutDefault>
      </div>
    </WithMobileSidebar>
  );
};

export { Home };
