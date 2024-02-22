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
        className="w-full bg-transparent py-3 text-4xl tracking-tight text-[--input-text-muted] placeholder-[var(--text-muted)] placeholder:italic hover:text-[--input-hover] focus:text-[--input-hover] focus:outline-0"
      />
    </div>
  )
}

const CachedTitle = memo(Title)

export { CachedTitle as Title }
