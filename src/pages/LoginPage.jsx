import { useGoogleLogin } from '@react-oauth/google';
import { HeartPulse, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext.jsx';

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

function GoogleLoginButton({ disabled, loading, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="
        group relative flex h-12 w-full items-center justify-center gap-3
        overflow-hidden rounded-2xl border border-slate-200 bg-white px-4
        text-sm font-bold text-slate-700 shadow-sm transition-all duration-200
        hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md
        active:translate-y-0 active:shadow-sm
        disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0
      "
    >
      <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin text-slate-500" />
          <span>Memverifikasi...</span>
        </>
      ) : (
        <>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 transition group-hover:bg-white">
            <GoogleMark />
          </span>
          <span>Masuk dengan Google</span>
        </>
      )}
    </button>
  );
}

export function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (tokenResponse) => {
    if (!tokenResponse?.access_token) {
      const message = 'Google tidak mengirim access token yang valid.';
      setError(message);
      toast.error(message);
      setGoogleSubmitting(false);
      return;
    }

    setError('');

    try {
      const result = await loginWithGoogle({
        accessToken: tokenResponse.access_token,
        role: 'patient'
      });

      const nextStep = result?.data?.nextStep;

      if (nextStep === 'COMPLETE_REGISTRATION') {
        const message =
          'Akun Google ini belum siap masuk ke CMS. Selesaikan onboarding akun PulseWise terlebih dahulu.';
        setError(message);
        toast.error(message);
        return;
      }

      if (nextStep === 'VERIFY_OTP') {
        const message =
          'Akun ini masih menunggu verifikasi OTP. Selesaikan verifikasi dulu di aplikasi PulseWise.';
        setError(message);
        toast.error(message);
        return;
      }

      toast.success('Berhasil masuk dengan akun Google.');
    } catch (loginError) {
      const message =
        loginError?.response?.data?.message ||
        'Login Google gagal. Pastikan akun ini memang sudah terhubung ke PulseWise.';
      setError(message);
      toast.error(message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const startGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    ux_mode: 'popup',
    scope: 'openid email profile',
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setGoogleSubmitting(false);
      const message = 'Login Google dibatalkan atau gagal dibuka.';
      setError(message);
      toast.error(message);
    }
  });

  if (isAuthenticated) {
    return <Navigate to="/articles" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="flex w-full max-w-200 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl md:flex-row">
        <div className="relative flex flex-col justify-between overflow-hidden bg-linear-to-br from-pulse to-pulse-dark p-10 text-white md:w-5/12">
          <div className="relative z-10 mb-12 flex items-center gap-3">
            <HeartPulse size={32} />
            <h1 className="text-2xl font-bold tracking-tight">PulseWise</h1>
          </div>

          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-extrabold leading-tight">
              Editorial workspace untuk edukasi.
            </h2>
            <p className="text-sm leading-relaxed text-pulse-100">
              Tulis artikel, ajukan review, moderasi konten, dan kelola cover
              image dalam satu panel kerja terpadu.
            </p>
          </div>

          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/10 blur-2xl" />
        </div>

        <div className="p-8 md:w-7/12 md:p-12">
          <div className="mx-auto max-w-sm">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                Masuk ke CMS
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Gunakan akun PulseWise Anda.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setSubmitting(true);
                setError('');

                try {
                  await login({ email, password });
                  toast.success('Berhasil masuk ke PulseWise CMS.');
                } catch (loginError) {
                  const message =
                    loginError?.response?.data?.message ||
                    'Login gagal. Periksa kembali email dan password.';
                  setError(message);
                  toast.error(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-pulse/30 focus:ring-4 focus:ring-pulse/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
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
                    placeholder="********"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-pulse/30 focus:ring-4 focus:ring-pulse/10"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || googleSubmitting || !email || !password}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-pulse py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-pulse-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk Sekarang'
                )}
              </button>
            </form>

            <div className="my-5 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              <span className="h-px flex-1 bg-slate-200" />
              <span>atau</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <GoogleLoginButton
              loading={googleSubmitting}
              disabled={submitting}
              onClick={() => {
                setError('');
                setGoogleSubmitting(true);

                /*
                  Penting:
                  startGoogleLogin() harus dipanggil langsung dari onClick.
                  Jangan taruh await, setTimeout, atau trigger click via ref.
                  Itu yang sering bikin popup dianggap blocked.
                */
                startGoogleLogin();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
