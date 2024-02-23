import { useEffect, useMemo, useRef, useState } from 'react'
import { type VirtuosoHandle } from 'react-virtuoso'
import { useTheme } from 'next-app-theme/use-theme'
import { Editors } from '@/feature/editor/components/Editors'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { GroupSet } from '@/components/GroupSet'
import { ConfigPanel } from '@/feature/config/components/ConfigPanel'
import { useToast } from '@/components/ui/use-toast'

const useAutoThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme()
  const { getConfig } = useAppActions()
  const { toast } = useToast()

  const fill = getConfig().fill.toLowerCase()

  useEffect(() => {
    if (
      theme === 'light' &&
      [
        '#fff',
        '#ffffff',
        '#eee',
        '#eeeeee',
        '#bbb',
        '#bbbbbb',
        '#aaa',
        '#aaaaaa',
      ].some(f => f === fill)
    ) {
      toggleTheme()
      setTimeout(() => {
        toast({
          title: 'Automatic theme switch',
          description:
            'The fill color conflicted with the light theme so it was switched to dark',
        })
      })
    }
    if (
      theme === 'dark' &&
      [
        '#000',
        '#000000',
        '#111',
        '#111111',
        '#222',
        '#222222',
        '#333',
        '#333333',
      ].some(f => f === fill)
    ) {
      toggleTheme()
      setTimeout(() => {
        toast({
          title: 'Automatic theme switch',
          description:
            'The fill color conflicted with the dark theme so it was switched to light',
        })
      })
    }
  }, [fill, theme, toast, toggleTheme])

  return null
}

/**
 * Update the group list when the hash changes.
 * This is a hack to get around the fact that getGroup is not reactive.
 */
const useGroupRender = () => {
  const { getGroup } = useAppActions()
  const hash = useAppStore(s => s.updateListHash)
  const [group, setGroup] = useState(getGroup())

  useAutoThemeSwitch()

  useEffect(() => {
    setGroup(getGroup())
  }, [hash, getGroup])
  return group
}

const Detail = () => {
  const group = useGroupRender()

  // TODO: Move this ref to a provider?
  const virtualListRef = useRef<VirtuosoHandle>(null)

  const activeEditors = useMemo(
    () =>
      group?.editors.filter(
        ([, data]) =>
          data.svg.output &&
          data.svg.output !== '<html xmlns="http://www.w3.org/1999/xhtml"/>'
      ) ?? [],
    [group?.editors]
  )

  const totalSaved = `${
    Math.round(
      activeEditors.reduce((acc, val) => val[1].svg.savings + acc, 0) * 100
    ) / 100
  } KB`

  return (
    <div className="grid gap-16">
      {activeEditors.length > 0 && (
        <div
          className="sticky top-[-5px] z-50 flex gap-6 rounded border border-t-[5px] bg-[--page-bg] px-6 py-3"
          role="toolbar"
        >
          <ConfigPanel />
        </div>
      )}
      <div>
        {!!group && (
          <GroupSet
            id={group.id}
            title={group.title}
            createdAt={group.createdAt}
            count={activeEditors.length}
            // eslint-disable-next-line react/jsx-no-leaked-render
            icons={activeEditors.length > 1 ? activeEditors : []}
            virtualListRef={virtualListRef}
            isHeader
          />
        )}
        <Editors virtualListRef={virtualListRef} />
      </div>
      {activeEditors.length > 1 && (
        <div className="fixed bottom-0 right-0 z-10 rounded-tl border-l border-t bg-background py-2 pl-4 pr-10 text-sm">
          Total saved: {totalSaved}
        </div>
      )}
    </div>
  )
}

export { Detail }
