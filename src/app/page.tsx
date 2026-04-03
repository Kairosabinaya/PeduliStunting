/** Homepage — Scrollytelling landing page (placeholder for Phase 3). */
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">
            PeduliStunting.id
          </h1>
          <p className="text-lg text-foreground/70 max-w-xl mx-auto">
            Platform edukasi stunting dan simulasi kebijakan berbasis model
            GTWENOLR untuk Indonesia.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
