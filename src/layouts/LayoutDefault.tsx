import { Header } from '@/layouts/components/Header'
import { Footer } from '@/layouts/components/Footer'
import { Toaster } from '@/components/ui/toaster'
import { ConfigPanel } from '@/feature/config/components/ConfigPanel'
import type { Group } from '@/utils/types'

// TODO: Convert to grid, clean up duplicated styles
const LayoutDefault = (props: {
  children: React.ReactNode
  activeEditors?: Group['editors']
}) => {
  return (
    <>
      <div className="min-h-screen">
        <header className="flex w-full max-w-[1200px] flex-col px-6 md:px-20">
          <Header />
        </header>
        <div className="flex items-start">
          <main
            id="top"
            className="grid w-full max-w-[1200px] flex-col px-6 md:px-20"
          >
            {props.children}
          </main>
          {(props.activeEditors ?? []).length > 0 && (
            <aside className="sticky right-10 top-24 hidden w-80 rounded-lg border bg-background px-10 py-8 2xl:block [@media(min-width:1690px)]:top-8">
              <ConfigPanel activeEditors={props.activeEditors ?? []} />
            </aside>
          )}
        </div>
        <footer className="flex w-full max-w-[1200px] flex-grow flex-col px-6 md:px-20">
          <Footer />
        </footer>
      </div>
      <Toaster />
    </>
  )
}

export { LayoutDefault }
