'use client'

import { useEffect, useState } from 'react'
import { Detail } from '@/components/Detail'
import { List } from '@/components/List'
import { useAppStore } from '@/hooks/appState'
import { LayoutDefault } from '@/layouts/LayoutDefault'
import { WithMobileSidebar } from '@/layouts/components/Sidebar'

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

  return (
    <WithMobileSidebar sidebarContent={List}>
      <LayoutDefault>
        <Detail />
      </LayoutDefault>
    </WithMobileSidebar>
  )
}
