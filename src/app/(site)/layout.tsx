import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileReserveBar } from "@/components/site/MobileReserveBar";
import { RevealObserver } from "@/components/site/RevealObserver";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main id="contenido">{children}</main>
      <Footer />
      <MobileReserveBar />
      <RevealObserver />
    </>
  );
}
