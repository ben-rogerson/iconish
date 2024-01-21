import { crossIcon } from '@/lib/icons'
import { tw } from '@/lib/utils'
import { type FunctionComponent, type MouseEventHandler } from 'react'

export const RemoveButton: FunctionComponent<{
  onClick: MouseEventHandler<HTMLButtonElement>
}> = props => {
  return (
    <button
      onClick={props.onClick}
      type="button"
      aria-label="Remove editor"
      className={tw([
        'group/button',
        'group-hover/editor:grid group-hover/set:grid',
        'relative z-30 hidden h-10 w-10 place-items-center',
      ])}
    >
      <div
        className={tw([
          'group-hover/button:bg-[var(--button-bg-hover)]',
          'absolute inset-0 rounded-full bg-transparent',
        ])}
      />
      <div
        className={tw([
          'text-[--button-text]',
          'group-hover/button:text-[--button-text-hover]',
          'text-md pointer-events-none relative z-0',
        ])}
      >
        {crossIcon}
      </div>
    </button>
  )
}
