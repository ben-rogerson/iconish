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
    <div className="relative flex-shrink-0">
      <input
        id="upload"
        type="file"
        accept=".svg"
        multiple
        onChange={handleOnChange}
        className="absolute inset-0 opacity-0 pointer-events-none"
      />
      <label
        htmlFor="upload"
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
      >
        Upload svg(s)
      </label>
    </div>
  );
}
