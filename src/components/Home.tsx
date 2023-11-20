"use client";
import { LayoutDefault } from "@/components/LayoutDefault";
import { Detail } from "@/components/Detail";
import { List } from "@/components/List";
import { useAppStore } from "@/hooks/appState";

const Home = () => {
  const hasHydrated = useAppStore((s) => s._hasHydrated);

  if (!hasHydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <LayoutDefault>
        <div className="grid gap-y-20">
          <Detail />
          <List />
        </div>
      </LayoutDefault>
    </div>
  );
};

export { Home };
