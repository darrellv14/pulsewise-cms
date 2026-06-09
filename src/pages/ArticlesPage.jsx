import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArticleCard } from '../components/ArticleCard.jsx';
import {
  EmptyState,
  ErrorState,
  InlineLoader
} from '../components/AsyncState.jsx';
import {
  fetchCategories,
  fetchPublishedArticles
} from '../lib/educationApi.js';
import { PULSEWISE_LOGO_FULL_URL } from '../config.js';
import { Search, Filter, Plus, Flame, Clock } from 'lucide-react';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'latest';

  const categoriesQuery = useQuery({
    queryKey: ['education', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000
  });

  const articlesQuery = useQuery({
    queryKey: [
      'education',
      'published-feed',
      { category, query, sort, limit: 12 }
    ],
    queryFn: () => {
      const params = { sort, limit: 12 };
      if (category) params.category = category;
      if (query.trim()) params.q = query.trim();
      return fetchPublishedArticles(params);
    }
  });

  useEffect(() => {
    if (categoriesQuery.error) {
      toast.error('Kategori gagal dimuat.');
    }
  }, [categoriesQuery.error]);

  useEffect(() => {
    if (articlesQuery.error) {
      toast.error(
        getErrorMessage(articlesQuery.error, 'Artikel gagal dimuat.')
      );
    }
  }, [articlesQuery.error]);

  const categories = categoriesQuery.data || [];
  const articlesState = articlesQuery.data || {
    items: [],
    pagination: { hasMore: false }
  };

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <section className="bg-linear-to-br from-pulse to-pulse-dark rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <img
            src={PULSEWISE_LOGO_FULL_URL}
            alt="PulseWise"
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Pusat Edukasi & Kesehatan Berbasis Klinis
          </h1>
          <p className="text-pulse-100 text-sm sm:text-base max-w-xl">
            Eksplorasi ribuan artikel terpercaya untuk gaya hidup sehat Anda.
            Temukan info terbaru seputar medis dan keseharian.
          </p>
          <div className="pt-4">
            <Link
              to="/editor/new"
              className="inline-flex items-center gap-2 bg-white text-pulse hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={18} />
              Mulai Menulis
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sticky top-0 z-30">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            className="w-full bg-slate-50 border border-transparent focus:border-pulse/30 focus:bg-white focus:ring-4 focus:ring-pulse/10 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-slate-700 transition-all outline-none"
            placeholder="Cari artikel nutrisi, aktivitas, obat..."
            value={query}
            onChange={(event) =>
              updateParams({ q: event.target.value.trim() || null })
            }
          />
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 shrink-0">
          <div className="relative min-w-50 flex-1 md:flex-none">
            <select
              value={category}
              onChange={(event) =>
                updateParams({ category: event.target.value || null })
              }
              className="w-full appearance-none bg-slate-50 border border-transparent focus:border-pulse/30 focus:bg-white focus:ring-4 focus:ring-pulse/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all outline-none cursor-pointer"
            >
              <option value="">Semua Kategori</option>
              {categories.map((item) => (
                <option key={item.categoryId} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <Filter
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${sort === 'latest' ? 'bg-white text-pulse shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => updateParams({ sort: 'latest' })}
            >
              <Clock size={16} /> Terbaru
            </button>
            <button
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${sort === 'popular' ? 'bg-white text-pulse shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => updateParams({ sort: 'popular' })}
            >
              <Flame size={16} /> Populer
            </button>
          </div>
        </div>
      </section>

      {articlesQuery.isLoading ? (
        <div className="flex justify-center p-12">
          <InlineLoader label="Mencari artikel terbaik untuk Anda..." />
        </div>
      ) : articlesQuery.isError ? (
        <ErrorState
          title="Ah, terjadi kesalahan"
          message={getErrorMessage(
            articlesQuery.error,
            'Artikel gagal dimuat.'
          )}
          actionLabel="Coba Lagi"
          onAction={() => articlesQuery.refetch()}
        />
      ) : articlesState.items.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 sm:px-0">
          {articlesState.items.map((article) => (
            <div key={article.articleId} className="h-full">
              <ArticleCard article={article} />
            </div>
          ))}
        </section>
      ) : (
        <div className="col-span-full">
          <EmptyState
            title="Artikel tidak ditemukan"
            message="Kami tidak bisa menemukan artikel dengan kriteria tersebut. Coba ubah kata kunci atau kategori pencarian Anda."
          />
        </div>
      )}
    </div>
  );
}
