import { HeartPulse, Lock, Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext.jsx';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/articles" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-200 w-full bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Branding & Info */}
        <div className="md:w-5/12 bg-linear-to-br from-pulse to-pulse-dark p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3 mb-12">
            <HeartPulse size={32} />
            <h1 className="font-bold text-2xl tracking-tight">PulseWise</h1>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">
              Editorial workspace untuk edukasi.
            </h2>
            <p className="text-pulse-100 text-sm leading-relaxed">
              Tulis artikel, ajukan review, moderasi konten, dan kelola cover
              image dalam satu panel kerja terpadu.
            </p>
          </div>
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 md:p-12">
          <div className="max-w-sm mx-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                Masuk ke CMS
              </h3>
              <p className="text-slate-500 text-sm mt-1">
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pulse/30 focus:ring-4 focus:ring-pulse/10 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 transition-all outline-none"
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
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-pulse/30 focus:ring-4 focus:ring-pulse/10 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 transition-all outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !email || !password}
                className="w-full bg-pulse hover:bg-pulse-dark text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
          </div>
        </div>
      </div>
    </div>
  );
}
