import { run } from "@/utils/run";
import React, { type ChangeEvent } from "react";

export function Upload(props: {
  onUpload: (files: Set<[string, string]>) => void;
}) {
  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();

    const svgFiles = event.currentTarget.files ?? [];

    // Use run to avoid passing an async function to an event handler
    void run(async () => {
      const allFiles = new Set<[string, string]>();
      for (const svgFile of svgFiles) {
        const svgContent = await svgFile.text();
        allFiles.add([
          svgFile.name.trim().replace(/.svg$/, "").replaceAll("-", " "),
          svgContent,
        ]);
      }
      props.onUpload(allFiles);
    });
  }

  return (
    <div className="relative border-2 border-[var(--line-border---bg-dark)] rounded px-4 py-1">
      <input
        type="file"
        accept=".svg"
        multiple
        onChange={handleOnChange}
        className="absolute inset-0 opacity-0"
      />
      <div className="pointer-events-none">Upload</div>
    </div>
  );
}
