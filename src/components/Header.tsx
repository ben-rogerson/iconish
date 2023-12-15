import { logoIcon } from "@/lib/icons";
import Link from "next/link";

export function Header() {
  // const { addGroup } = useAppActions();

  return (
    <div className="flex justify-between pb-3 pt-6" data-testid="header">
      <Link href="/" className="flex gap-x-[0.25em] text-2xl">
        {logoIcon}
        <div>Iconish</div>
      </Link>
      <h1>Shape your svg icons into consistent sets</h1>
      {/* <button
        className="flex items-center gap-2 text-[--text-muted] hover:text-[--text]"
        onClick={addGroup}
        type="button"
      >
        Add a set {setIcon}
      </button> */}
    </div>
  );
}
