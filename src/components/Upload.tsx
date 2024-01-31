import { uploadIcon } from '@/lib/icons'
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
    <div
      className={cn(
        'w-full rounded border px-5 py-3 text-center text-[--input-text] placeholder-[var(--text-muted)] focus:outline-0',
        props.className
      )}
    >
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
        className="flex h-full items-center justify-center gap-3"
      >
        <div>{uploadIcon}</div>
        <div>Upload SVG&hellip;</div>
      </label>
    </div>
  )
}
