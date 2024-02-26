import { crossIcon } from '@/lib/icons'
import { type FunctionComponent, type MouseEventHandler } from 'react'

export const RemoveButton: FunctionComponent<{
  onClick: MouseEventHandler<HTMLButtonElement>
}> = props => {
  return (
    <button
      onClick={props.onClick}
      type="button"
      aria-label="Remove editor"
      className="group/button relative z-30 hidden h-10 w-10 place-items-center group-hover/editor:grid group-hover/set:grid"
    >
      <div className="absolute inset-0 rounded-full bg-transparent group-hover/button:bg-[var(--button-bg-hover)]" />
      <div className="pointer-events-none relative z-0 text-[1.75em] text-[--button-text] group-hover/button:text-[--button-text-hover]">
        {crossIcon}
      </div>
    </button>
  )
}
