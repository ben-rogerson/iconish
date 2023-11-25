import { useCopyToClipboard } from "usehooks-ts";
import { useAppActions } from "@/hooks/appState";

export const useCopySvgsToClipboard = (groupId: string) => {
  const { getSvgsFromGroupId } = useAppActions();
  const [hasCopied, setCopied] = useCopyToClipboard();

  return {
    copy: () => {
      void setCopied(getSvgsFromGroupId(groupId));
    },
    hasCopied,
  };
};
