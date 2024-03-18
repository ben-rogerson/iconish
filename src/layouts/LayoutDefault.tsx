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
      <div className="mx-6 min-h-screen md:mx-20">
        <header className="flex max-w-[1200px] flex-col">
          <Header />
        </header>
        <div className="flex min-h-[400px] items-start">
          <main
            id="top"
            className="grid w-full max-w-[1200px] flex-col 2xl:pr-20"
          >
            {props.children}
          </main>
          {(props.activeEditors ?? []).length > 0 && (
            <aside className="sticky right-10 top-24 hidden min-w-fit max-w-fit rounded-lg border bg-background px-10 py-8 2xl:block [@media(min-width:1785px)]:top-8">
              <ConfigPanel activeEditors={props.activeEditors ?? []} />
            </aside>
          )}
        </div>
        <footer className="flex w-full flex-grow flex-col">
          <Footer />
        </footer>
      </div>
      <Toaster />
    </>
  )
}

export { LayoutDefault }
