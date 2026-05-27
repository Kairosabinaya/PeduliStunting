import { APP_NAME } from "@/config/app";

export default function NotFound() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="max-w-prose text-base text-muted-foreground">
        Halaman yang Anda cari tidak ditemukan di {APP_NAME}.
      </p>
    </main>
  );
}
