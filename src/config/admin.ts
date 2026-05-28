/**
 * Copy for the admin management surface. Centralised so component code
 * stays free of hardcoded strings (project guidelines §2.2).
 */

export const ADMIN_USERS_COPY = {
  metaTitle: "Kelola Pengguna",
  eyebrow: "Admin",
  title: "Kelola pengguna",
  description:
    "Daftar lengkap akun pengguna Peduli Stunting. Hapus akun untuk testing pendaftaran ulang.",
} as const;

export const ADMIN_USERS_TABLE_COPY = {
  emptyTitle: "Belum ada pengguna",
  emptyDescription:
    "Akun baru akan muncul di sini begitu pengguna pertama mendaftar.",
  errorTitle: "Gagal memuat pengguna",
  errorDescription:
    "Terjadi gangguan saat memuat daftar pengguna. Refresh halaman atau cek koneksi Supabase.",
  columns: {
    user: "Pengguna",
    email: "Email",
    role: "Peran",
    status: "Status email",
    createdAt: "Terdaftar",
    lastSignIn: "Login terakhir",
    actions: "Aksi",
  },
  statusVerified: "Terverifikasi",
  statusPending: "Menunggu verifikasi",
  roleAdmin: "Admin",
  roleUser: "Pengguna",
  neverSignedIn: "Belum pernah",
  deleteAction: "Hapus",
  deleteSelf: "Akun Anda",
} as const;

export const ADMIN_DELETE_DIALOG_COPY = {
  title: "Hapus akun pengguna?",
  description:
    "Akun, profil, dan semua data yang terkait akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.",
  confirm: "Hapus akun",
  cancel: "Batal",
  pending: "Menghapus...",
  successMessage: "Akun berhasil dihapus.",
} as const;
