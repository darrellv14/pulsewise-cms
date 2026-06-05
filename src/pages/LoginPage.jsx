import { GoogleLogin } from '@react-oauth/google';
import { HeartPulse, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext.jsx';

export function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNormalLogin = async (event) => {
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
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      const message = 'Google tidak mengirim ID token yang valid.';
      setError(message);
      toast.error(message);
      setGoogleSubmitting(false);
      return;
    }

    setGoogleSubmitting(true);
    setError('');

    try {
      const result = await loginWithGoogle({
        idToken: credentialResponse.credential,
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

            <form className="space-y-5" onSubmit={handleNormalLogin}>
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

            <div className="relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-white transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md">
              <div
                className={
                  googleSubmitting ? 'pointer-events-none opacity-0' : 'w-full'
                }
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    const message =
                      'Login Google dibatalkan atau gagal dibuka.';
                    setError(message);
                    toast.error(message);
                    setGoogleSubmitting(false);
                  }}
                  type="standard"
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="320"
                  locale="id"
                  useOneTap={false}
                />
              </div>

              {googleSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-2xl bg-white/90 text-sm font-bold text-slate-500 backdrop-blur-sm">
                  <Loader2 size={18} className="animate-spin" />
                  Memverifikasi...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
