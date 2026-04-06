/** Custom 404 page — tampil saat halaman tidak ditemukan. */
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl font-bold text-primary-600 mb-4">404</p>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-foreground/60 mb-8">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
