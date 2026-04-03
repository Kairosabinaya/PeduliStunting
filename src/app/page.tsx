/** Homepage — Scrollytelling landing page tentang stunting di Indonesia. */
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Scene1,
  Scene2,
  Scene3,
  Scene4,
  Scene5,
  ScrollProgress,
} from "@/components/scrollytelling";

export const metadata: Metadata = {
  title: "PeduliStunting.id — Pahami Stunting, Mulai dari Data",
  description:
    "1 dari 4 anak Indonesia mengalami stunting. Jelajahi data, pahami penyebab, dan temukan solusi melalui simulasi kebijakan berbasis model GTWENOLR.",
};

export default function HomePage() {
  return (
    <>
      <Header variant="transparent" />
      <ScrollProgress />
      <main>
        <Scene1 />
        <Scene2 />
        <Scene3 />
        <Scene4 />
        <Scene5 />
      </main>
      <Footer />
    </>
  );
}
