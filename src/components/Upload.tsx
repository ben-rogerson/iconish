import { cn } from '@/lib/utils'
import { run } from '@/utils/run'
import React, { type ChangeEvent } from 'react'

export function Upload(props: {
  onUpload: (files: Set<[string, string]>) => void
  className?: string
}) {
  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault()

    const svgFiles = event.currentTarget.files ?? []

    // Use run to avoid passing an async function to an event handler
    void run(async () => {
      const allFiles = new Set<[string, string]>()
      for (const svgFile of svgFiles) {
        const svgContent = await svgFile.text()
        allFiles.add([
          svgFile.name.trim().replace(/.svg$/, '').replaceAll('-', ' '),
          svgContent,
        ])
      }
      props.onUpload(allFiles)
    })
  }

  return (
    <div className={cn('relative flex-shrink-0', props.className)}>
      <input
        id="upload"
        type="file"
        accept=".svg"
        multiple
        onChange={handleOnChange}
        className="pointer-events-none absolute inset-0 opacity-0"
      />
      <label
        htmlFor="upload"
        // className="inline-flex h-10 w-full cursor-pointer items-center justify-center whitespace-nowrap rounded border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        Upload svg&hellip;
      </label>
    </div>
  )
}
