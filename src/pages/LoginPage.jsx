import { Loader2, Lock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  GOOGLE_CLIENT_ID,
  PULSEWISE_LOGO_FULL_URL,
  PULSEWISE_LOGO_ICON_URL
} from '../config.js';

const GOOGLE_OAUTH_STATE_KEY = 'pulsewise-cms-google-oauth-state';

function buildGoogleOAuthState() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getGoogleRedirectUri() {
  return `${window.location.origin}/login`;
}

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

  const handleGoogleToken = async ({ accessToken, idToken }) => {
    if (!accessToken && !idToken) {
      const message = 'Google tidak mengirim token yang valid.';
      setError(message);
      toast.error(message);
      setGoogleSubmitting(false);
      return;
    }

    setGoogleSubmitting(true);
    setError('');

    try {
      const result = await loginWithGoogle({
        accessToken,
        idToken,
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

  useEffect(() => {
    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, '')
    );
    const accessToken = hashParams.get('access_token');
    const errorCode = hashParams.get('error');
    const returnedState = hashParams.get('state');

    if (!accessToken && !errorCode) {
      return;
    }

    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`
    );

    const expectedState = window.sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
    window.sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);

    if (errorCode) {
      const message =
        errorCode === 'access_denied'
          ? 'Login Google dibatalkan.'
          : `Login Google gagal: ${errorCode}`;

      setError(message);
      toast.error(message);
      setGoogleSubmitting(false);
      return;
    }

    if (!expectedState || returnedState !== expectedState) {
      const message = 'Sesi login Google tidak valid. Coba masuk ulang.';

      setError(message);
      toast.error(message);
      setGoogleSubmitting(false);
      return;
    }

    handleGoogleToken({ accessToken });
    // The hash is only present on the Google redirect callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const beginGoogleRedirectLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      const message = 'Google OAuth belum dikonfigurasi untuk CMS.';
      setError(message);
      toast.error(message);
      return;
    }

    setGoogleSubmitting(true);
    setError('');

    const state = buildGoogleOAuthState();
    window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: getGoogleRedirectUri(),
      response_type: 'token',
      scope: 'openid email profile',
      include_granted_scopes: 'true',
      prompt: 'select_account',
      state
    });

    window.location.assign(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  };

  if (isAuthenticated) {
    return <Navigate to="/articles" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="flex w-full max-w-260 flex-col overflow-hidden rounded-4xl border border-slate-200/60 bg-white shadow-2xl md:flex-row">
        <div className="relative flex w-full flex-col justify-between overflow-hidden border-r border-slate-100 bg-slate-50 p-10 md:w-5/12">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

          <div className="relative z-10">
            <img
              src={PULSEWISE_LOGO_FULL_URL}
              alt="PulseWise"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="relative z-10 mb-4 mt-20">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900">
              Editorial workspace untuk edukasi.
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Tulis artikel, ajukan review, moderasi konten, dan kelola cover
              image dalam satu panel kerja terpadu.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center p-8 md:w-7/12 md:p-12 lg:p-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <img
                src={PULSEWISE_LOGO_ICON_URL}
                alt="PulseWise icon"
                className="mb-6 h-14 w-14 rounded-2xl bg-white object-contain p-2 shadow-sm ring-1 ring-slate-200"
              />
              <h3 className="text-2xl font-bold text-slate-900">
                Masuk ke CMS
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Gunakan kredensial akun administrator Anda.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleNormalLogin}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
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
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
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
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
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
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-600/30 disabled:cursor-not-allowed disabled:opacity-70"
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

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-slate-200" />
              <span>atau</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="relative">
              <button
                type="button"
                disabled={submitting || googleSubmitting}
                onClick={beginGoogleRedirectLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <GoogleMark />
                Masuk Dengan Google
              </button>

              {googleSubmitting && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-white/90 text-sm font-bold text-slate-500 backdrop-blur-sm">
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

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
