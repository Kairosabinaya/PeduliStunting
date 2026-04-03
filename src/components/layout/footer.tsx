/** Footer — site-wide footer with logo, navigation links, and copyright. */
import Link from "next/link";

const FOOTER_LINKS = {
  platform: [
    { href: "/peta", label: "Peta Interaktif" },
    { href: "/edukasi", label: "Edukasi" },
    { href: "/harga", label: "Harga" },
  ],
  informasi: [
    { href: "/edukasi/artikel", label: "Artikel" },
    { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
    { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
  ],
} as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & description */}
          <div>
            <Link href="/" className="text-xl font-bold">
              PeduliStunting
            </Link>
            <p className="mt-3 text-sm text-primary-300 leading-relaxed">
              Platform edukasi stunting dan simulasi kebijakan berbasis model
              GTWENOLR untuk Indonesia.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-300">
              Platform
            </h3>
            <ul className="mt-3 space-y-2">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-300">
              Informasi
            </h3>
            <ul className="mt-3 space-y-2">
              {FOOTER_LINKS.informasi.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-sm text-primary-300">
          &copy; {currentYear} PeduliStunting.id. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
