import {
  BookOpen,
  FilePenLine,
  LogOut,
  ShieldCheck,
  Search,
  Menu,
  X,
  HeartPulse
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

const navItems = [
  { to: '/articles', label: 'Edukasi', icon: BookOpen },
  { to: '/my-articles', label: 'Artikel Saya', icon: FilePenLine }
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (location.pathname === '/articles') {
      setSearchValue(searchParams.get('q') || '');
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 text-pulse font-bold text-lg">
          <HeartPulse size={24} />
          <span>PulseWise</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white w-64 border-r border-slate-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="hidden md:flex p-6 items-center gap-3 border-b border-slate-100">
          <div className="bg-pulse/10 p-2 rounded-xl text-pulse">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">
              PW CMS
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Workspace
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu Utama
          </p>
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium ${isActive ? 'bg-pulse text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}

            {user?.role === 'admin' && (
              <>
                <div className="pt-6 pb-2">
                  <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                <NavLink
                  to="/moderation"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors font-medium ${isActive ? 'bg-pulse text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                  }
                >
                  <ShieldCheck size={18} />
                  <span>Moderasi Artikel</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 mb-3">
            <div className="w-8 h-8 rounded-full bg-pulse flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user?.username || user?.firstName || 'P')[0].toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.username || user?.email}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="hidden md:flex bg-white h-16 border-b border-slate-200 px-8 items-center justify-between shrink-0">
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
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse transition-shadow"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
