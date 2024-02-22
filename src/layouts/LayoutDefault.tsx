import { Header } from '@/layouts/components/Header'
import { Footer } from '@/layouts/components/Footer'
import { Toaster } from '@/components/ui/toaster'

const LayoutDefault = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex min-h-screen w-full max-w-[1200px] flex-col px-6 md:px-20">
        <header>
          <Header />
        </header>
        <main id="top">{children}</main>
        <footer className="grid flex-grow">
          <Footer />
        </footer>
      </div>
      <Toaster />
    </>
  )
}

export { LayoutDefault }
