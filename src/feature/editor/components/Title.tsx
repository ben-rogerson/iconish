import { memo } from 'react'
import { useAppActions } from '@/hooks/appState'

const Title = (props: { title: string; id: string; svgId?: string }) => {
  const { updateEditorTitle } = useAppActions()

  const placeholder =
    (!props.title && props.svgId?.toLowerCase()) || 'Untitled icon…'

  return (
    <div className="relative inline-block border-0 border-b border-b-transparent">
      <input
        type="text"
        spellCheck={false}
        defaultValue={(props.title !== '' ? props.title : props.svgId) ?? ''}
        placeholder={placeholder}
        onChange={e => {
          updateEditorTitle(props.id, e.currentTarget.value)
        }}
        className="w-full bg-transparent py-3 font-serif text-4xl text-[--input-text-muted] placeholder-[var(--text-muted)] transition-colors placeholder:italic focus:text-[--input-hover] focus:outline-0 group-hover/editor:text-[--input-hover]"
      />
    </div>
  )
}

const CachedTitle = memo(Title)

export { CachedTitle as Title }
