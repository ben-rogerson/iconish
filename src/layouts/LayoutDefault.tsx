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
      <div className="mx-6 min-h-screen max-w-[1100px] md:mx-20 2xl:max-w-[1300px]">
        <div className="grid">
          <header>
            <Header />
          </header>
          <div className="flex items-start">
            <main id="top" className="grid w-full flex-col">
              {props.children}
            </main>
            {(props.activeEditors ?? []).length > 0 && (
              <aside className="sticky right-10 top-24 hidden min-w-fit max-w-fit rounded-lg border bg-background px-10 py-8 2xl:ml-20 2xl:block [@media(min-width:1785px)]:top-8">
                <ConfigPanel activeEditors={props.activeEditors ?? []} />
              </aside>
            )}
          </div>
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
