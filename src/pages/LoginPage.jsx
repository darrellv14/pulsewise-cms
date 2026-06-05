import { HeartPulse, Loader2, Lock, Mail } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext.jsx';
import { GOOGLE_CLIENT_ID } from '../config.js';

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7963 2.7164v2.2582h2.9086c1.7018-1.5668 2.6836-3.8741 2.6836-6.6155z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1791l-2.9086-2.2582c-.8059.54-1.8368.8591-3.0477.8591-2.3441 0-4.3282-1.5827-5.0373-3.7105H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.9627 10.7105A5.4108 5.4108 0 013.6818 9c0-.5945.1023-1.1727.2809-1.7105V4.9577H.9573A8.9986 8.9986 0 000 9c0 1.4523.3482 2.8277.9573 4.0423l3.0054-2.3318z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5782c1.3214 0 2.5078.4541 3.4405 1.3459l2.5813-2.5814C13.4632.8918 11.426.0001 9 .0001 5.4818.0001 2.4382 2.0168.9573 4.9577l3.0054 2.3318C4.6718 5.1609 6.6559 3.5782 9 3.5782z"
      />
    </svg>
  );
}

export function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);

  const handleGoogleCredential = useCallback(
    async (response) => {
      if (!response?.credential) {
        toast.error('Google tidak mengirim token login yang valid.');
        return;
      }

      setGoogleSubmitting(true);
      setGoogleError('');
      setError('');

      try {
        const result = await loginWithGoogle({
          idToken: response.credential,
          role: 'patient'
        });
        const nextStep = result?.data?.nextStep;

        if (nextStep === 'COMPLETE_REGISTRATION') {
          toast.error(
            'Akun Google ini belum siap masuk ke CMS. Selesaikan onboarding akun PulseWise terlebih dahulu.'
          );
          return;
        }

        if (nextStep === 'VERIFY_OTP') {
          toast.error(
            'Akun ini masih menunggu verifikasi OTP. Selesaikan verifikasi dulu di aplikasi PulseWise.'
          );
          return;
        }

        toast.success('Berhasil masuk dengan akun Google.');
      } catch (loginError) {
        const message =
          loginError?.response?.data?.message ||
          'Login Google gagal. Pastikan akun ini memang sudah terhubung ke PulseWise.';
        setGoogleError(message);
        toast.error(message);
      } finally {
        setGoogleSubmitting(false);
      }
    },
    [loginWithGoogle]
  );

  const renderGoogleButton = useCallback(() => {
    if (
      !window.google?.accounts?.id ||
      !googleButtonRef.current ||
      !GOOGLE_CLIENT_ID
    ) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup'
    });

    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: googleButtonRef.current.offsetWidth || 360
    });
    setGoogleReady(true);
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError('Google Client ID belum dikonfigurasi di CMS.');
      return undefined;
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return undefined;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      renderGoogleButton();
    };
    script.onerror = () => {
      setGoogleError('Gagal memuat Google Sign-In. Coba refresh halaman lagi.');
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [renderGoogleButton]);

  if (isAuthenticated) {
    return <Navigate to="/articles" replace />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-white to-amber-50 p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[32px] border border-rose-100 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] md:min-h-[calc(100vh-3rem)]">
        <div className="hidden w-[44%] flex-col justify-between bg-linear-to-br from-pulse to-pulse-dark px-10 py-12 text-white md:flex">
          <div>
            <div className="mb-14 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 ring-1 ring-white/20">
                <HeartPulse size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                  PulseWise
                </p>
                <h1 className="text-2xl font-bold tracking-tight">
                  CMS Workspace
                </h1>
              </div>
            </div>
            <div className="max-w-md space-y-5">
              <h2 className="text-4xl font-black leading-tight">
                Kelola edukasi kesehatan dengan panel kerja yang rapi.
              </h2>
              <p className="text-sm leading-7 text-white/80">
                Tulis artikel, unggah visual, ajukan review, dan moderasi semua
                konten edukasi PulseWise dari satu tempat yang terasa tenang
                dipakai tiap hari.
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-white/85">
            <div className="rounded-2xl border border-white/14 bg-white/10 px-4 py-4 backdrop-blur-xs">
              Artikel tidak langsung tayang. Semua konten tetap melewati
              approval admin.
            </div>
            <div className="rounded-2xl border border-white/14 bg-white/10 px-4 py-4 backdrop-blur-xs">
              Akun yang login dengan Google harus sudah terhubung ke akun
              PulseWise aktif.
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 md:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 md:hidden">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pulse text-white shadow-sm">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-pulse/70">
                    PulseWise
                  </p>
                  <h1 className="text-xl font-bold text-slate-900">
                    CMS Workspace
                  </h1>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                Masuk untuk menulis, mengelola, dan meninjau artikel edukasi
                PulseWise.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Masuk ke CMS
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gunakan akun PulseWise Anda. Email dan password tetap didukung,
                dan akun Google bisa dipakai kalau memang sudah terhubung.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setSubmitting(true);
                setError('');
                setGoogleError('');
                try {
                  await login({ email, password });
                  toast.success('Berhasil masuk ke PulseWise CMS.');
                } catch (loginError) {
                  setError(
                    loginError?.response?.data?.message ||
                      'Login gagal. Periksa kembali email dan password.'
                  );
                  toast.error(
                    loginError?.response?.data?.message || 'Login gagal.'
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    placeholder="nama@email.com"
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-pulse/35 focus:bg-white focus:ring-4 focus:ring-pulse/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    required
                    placeholder="��������"
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-pulse/35 focus:bg-white focus:ring-4 focus:ring-pulse/10"
                  />
                </div>
              </div>

              {(error || googleError) && (
                <div className="space-y-2">
                  {error && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}
                  {googleError && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                      {googleError}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || googleSubmitting || !email || !password}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-pulse font-bold text-white shadow-sm transition hover:bg-pulse-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Memproses...
                  </>
                ) : (
                  'Masuk Sekarang'
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
              <span className="h-px flex-1 bg-slate-200" />
              <span>atau</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-700">
                <GoogleMark />
                <span>Masuk dengan Google</span>
              </div>
              <p className="mb-4 text-sm leading-6 text-slate-500">
                Cocok untuk akun PulseWise yang memang sudah terhubung ke
                Google.
              </p>
              <div
                ref={googleButtonRef}
                className="min-h-[44px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white"
              />
              {!googleReady && !googleError && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Menyiapkan
                  tombol Google...
                </div>
              )}
              {googleSubmitting && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Loader2 size={14} className="animate-spin" /> Memverifikasi
                  akun Google...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
