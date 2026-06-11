import {
  BookOpen,
  FilePenLine,
  LogOut,
  ShieldCheck,
  Search,
  Menu,
  X
} from 'lucide-react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useEffect, useState } from 'react';
import {
  PULSEWISE_LOGO_FULL_URL,
  PULSEWISE_LOGO_ICON_URL
} from '../config.js';

const navItems = [
  { to: '/articles', label: 'Edukasi', icon: BookOpen },
  { to: '/my-articles', label: 'Artikel Saya', icon: FilePenLine }
];

function resolveUserAvatar(user) {
  return user?.avatarPhoto || user?.avatarUrl || user?.avatar || null;
}

export function AppLayout() {
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const userAvatar = resolveUserAvatar(user);

  useEffect(() => {
    if (location.pathname === '/articles') {
      setSearchValue(searchParams.get('q') || '');
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (location.pathname !== '/articles') {
        return;
      }

      const params = new URLSearchParams(searchParams);
      const normalized = searchValue.trim();

      if (normalized) {
        params.set('q', normalized);
      } else {
        params.delete('q');
      }

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `/articles?${nextQuery}` : '/articles';
      const currentUrl = `${location.pathname}${location.search}`;

      if (currentUrl !== nextUrl) {
        navigate(nextUrl, { replace: true });
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search, navigate, searchParams, searchValue]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (event) => {
    const nextValue = event.target.value;
    setSearchValue(nextValue);

    if (location.pathname !== '/articles') {
      const trimmed = nextValue.trim();
      navigate(
        trimmed ? `/articles?q=${encodeURIComponent(trimmed)}` : '/articles'
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.875rem)] md:hidden">
        <img
          src={PULSEWISE_LOGO_FULL_URL}
          alt="PulseWise"
          className="h-8 w-auto max-w-36 object-contain"
        />
        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <aside
        className={`fixed left-0 z-40 flex w-[min(85vw,20rem)] max-w-sm flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-in-out md:static md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} top-[calc(env(safe-area-inset-top)+4.75rem)] bottom-0 rounded-tr-3xl md:top-0 md:bottom-auto md:rounded-none`}
      >
        <div className="hidden items-center gap-3 border-b border-slate-100 px-5 py-5 md:flex">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pulse/8 p-2">
            <img
              src={PULSEWISE_LOGO_ICON_URL}
              alt="PulseWise icon"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <img
              src={PULSEWISE_LOGO_FULL_URL}
              alt="PulseWise"
              className="h-6 w-auto max-w-33 object-contain object-left"
            />
            <p className="text-xs font-medium tracking-wide text-slate-400">
              Workspace
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 md:py-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${isActive ? 'bg-pulse text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}

            {user?.role === 'admin' ? (
              <>
                <div className="pb-2 pt-6">
                  <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Admin
                  </p>
                </div>
                <NavLink
                  to="/moderation"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${isActive ? 'bg-pulse text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                  }
                >
                  <ShieldCheck size={18} />
                  <span>Moderasi Artikel</span>
                </NavLink>
              </>
            ) : null}
          </nav>
        </div>

        <div className="border-t border-slate-200 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pulse text-sm font-bold text-white">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={user?.username || user?.email || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                (user?.username || user?.firstName || 'P')[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.username || user?.email}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {user?.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col md:h-screen">
        <header className="hidden h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 md:flex">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Cari artikel edukasi..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm transition-shadow focus:border-pulse focus:outline-none focus:ring-2 focus:ring-pulse/20"
            />
          </div>
        </header>

        <div className="w-full flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      ) : null}
    </div>
  );
}
