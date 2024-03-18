'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-app-theme/use-theme'
import { Detail } from '@/components/Detail'
import { List } from '@/components/List'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { LayoutDefault } from '@/layouts/LayoutDefault'
import {
  WithConfigSidebar,
  WithMobileSidebar,
} from '@/layouts/components/Sidebar'
import { ConfigPanel } from '@/feature/config/components/ConfigPanel'
import { useToast } from '@/components/ui/use-toast'

// TODO: Move to feature/theme/theme.hooks.ts
// TODO: Fix bug with auto theme switching
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
  const [group, setGroup] = useState(getGroup({ withPlaceholders: false }))

  useAutoThemeSwitch()

  useEffect(() => {
    setGroup(getGroup({ withPlaceholders: false }))
  }, [hash, getGroup])
  return group
}

const IconSets = () => {
  const group = useGroupRender()

  const activeEditors = group?.editors ?? []

  return (
    <WithConfigSidebar
      activeEditors={activeEditors}
      sidebarContent={ConfigPanel}
    >
      <WithMobileSidebar sidebarContent={List}>
        <LayoutDefault activeEditors={activeEditors}>
          <Detail
            group={group}
            activeEditors={activeEditors}
            iconSetType={group?.config.iconSetType}
          />
        </LayoutDefault>
      </WithMobileSidebar>
    </WithConfigSidebar>
  )
}

export const Home = () => {
  const hasHydrated = useAppStore(s => s._hasHydrated)
  // https://nextjs.org/docs/messages/react-hydration-error#solution-1-using-useeffect-to-run-on-the-client-only
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !hasHydrated)
    return (
      <LayoutDefault>
        <div className="grid h-full w-full place-content-center p-10">
          <span className="loader" />
        </div>
      </LayoutDefault>
    )

  return <IconSets />
}
