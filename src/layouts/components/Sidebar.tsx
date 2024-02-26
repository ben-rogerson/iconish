import { Boxes, Cog } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAppStore } from '@/hooks/appState'
import dynamic from 'next/dynamic'
import type { Group } from '@/utils/types'

// Don't SSR the toggle since the value on the server will be different than the client
const SetThemeButton = dynamic(
  () => import('@/components/Theme').then(i => i.ThemeToggler),
  {
    ssr: false,
    loading: () => <div />,
  }
)

export const WithMobileSidebar = ({
  children,
  sidebarContent: SidebarContent,
}: {
  children: React.ReactNode
  sidebarContent: () => JSX.Element
}) => {
  const { groups } = useAppStore(s => s)
  return (
    <>
      <Sheet>
        <div className="fixed right-0 top-[9em] z-50 grid h-[4em] w-[4em] place-content-center 2xl:right-[6em] 2xl:top-[1em]">
          <SetThemeButton className="h-[2em] w-[2em]" />
        </div>
        <SheetTrigger
          className="fixed right-0 top-[1em] z-50 grid h-[4em] w-[4em] place-content-center 2xl:right-[2em] 2xl:top-[1em]"
          aria-label="View icon sets"
        >
          <div className="relative">
            <Boxes size={24} className="h-[2em] w-[2em]" />
            {groups.length > 1 && (
              <span className="absolute -right-2 -top-1 rounded-full bg-[--page-bg] px-1 text-xs">
                {groups.length}
              </span>
            )}
          </div>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="overflow-y-auto px-7"
          data-testid="sidebar"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
      {children}
    </>
  )
}

export const WithConfigSidebar = (props: {
  children: React.ReactNode
  sidebarContent: (props: { activeEditors: Group['editors'] }) => JSX.Element
  activeEditors: Group['editors']
}) => {
  const SidebarContent = props.sidebarContent
  return (
    <>
      <Sheet>
        <div className="fixed right-0 top-[5em] z-10 flex">
          <SheetTrigger
            className="grid h-[4em] w-[4em] place-content-center 2xl:hidden"
            aria-label="View set options"
          >
            <Cog className="h-[2em] w-[2em]" />
          </SheetTrigger>
        </div>
        <SheetContent
          side="right"
          className="overflow-y-auto px-7 py-10 2xl:hidden"
          data-testid="options-sidebar-small"
        >
          <SidebarContent activeEditors={props.activeEditors} />
        </SheetContent>
      </Sheet>
      {props.children}
    </>
  )
}
