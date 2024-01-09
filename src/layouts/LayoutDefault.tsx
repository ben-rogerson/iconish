import { Header } from '@/layouts/components/Header'
// import { Footer } from "@/components/Footer";
import { Toaster } from '@/components/ui/toaster'

const LayoutDefault = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="w-full max-w-[1200px] px-4 md:px-20">
        <header>
          <Header />
        </header>
        <main>{children}</main>
      </div>
      {/* <footer>
        <Footer />
      </footer> */}
      <Toaster />
    </div>
  )
}

export { LayoutDefault }
