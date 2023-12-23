import { Header } from "@/components/Header";
// import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

const LayoutDefault = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="px-4 md:px-20 w-full max-w-[1200px]">
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
  );
};

export { LayoutDefault };
