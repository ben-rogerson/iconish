import { useAppActions } from "@/hooks/appState";
import { logoIcon, setIcon } from "@/lib/icons";
import Link from "next/link";

export function Header() {
  const { addGroup } = useAppActions();

  return (
    <div className="flex justify-between pb-5 pt-8">
      <Link href="/" className="flex gap-x-[0.25em] text-2xl">
        {logoIcon}
        <div>Iconish</div>
      </Link>
      <button
        className="flex items-center gap-2 text-[--text-muted] hover:text-[--text]"
        onClick={addGroup}
      >
        Add a set {setIcon}
      </button>
    </div>
  );
}
