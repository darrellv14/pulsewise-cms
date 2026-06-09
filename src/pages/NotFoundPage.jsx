import { Compass, Home, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { PULSEWISE_LOGO_FULL_URL, PULSEWISE_LOGO_ICON_URL } from '../config.js';

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white px-8 py-14 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl bg-pulse/8 p-3">
          <img
            src={PULSEWISE_LOGO_ICON_URL}
            alt="PulseWise icon"
            className="h-full w-full object-contain"
          />
        </div>

        <img
          src={PULSEWISE_LOGO_FULL_URL}
          alt="PulseWise"
          className="mx-auto mb-4 h-10 w-auto object-contain"
        />
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
          Rute yang kamu buka tidak tersedia, mungkin link-nya berubah atau
          halaman itu belum ada. Tenang, kita bisa balik ke area yang benar
          tanpa nyasar lama-lama.
        </p>

        <div className="mt-10 grid gap-4 rounded-3xl bg-slate-50 p-5 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-pulse/10 text-pulse">
              <Compass size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Cek rute aktif
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Untuk CMS berbasis React Router di Vercel, refresh halaman
              sekarang sudah diarahkan ulang ke aplikasi, jadi rute lain akan
              tetap masuk ke frontend.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Home size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Balik ke area aman
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gunakan tombol di bawah untuk kembali ke daftar artikel atau ke
              layar masuk, tergantung status sesi kamu sekarang.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isAuthenticated ? (
            <>
              <Link
                to="/articles"
                className="inline-flex min-w-52 items-center justify-center gap-2 rounded-2xl bg-pulse px-5 py-3 font-semibold text-white transition-colors hover:bg-pulse-dark"
              >
                <Home size={18} />
                Kembali ke Edukasi
              </Link>
              <Link
                to="/my-articles"
                className="inline-flex min-w-52 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:border-pulse/30 hover:text-pulse"
              >
                <Compass size={18} />
                Buka Artikel Saya
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex min-w-52 items-center justify-center gap-2 rounded-2xl bg-pulse px-5 py-3 font-semibold text-white transition-colors hover:bg-pulse-dark"
            >
              <LogIn size={18} />
              Kembali ke Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
