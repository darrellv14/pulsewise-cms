import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Filter, Plus, Flame, Clock } from 'lucide-react';
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
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-12 md:p-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[24px_24px]" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-rose-50 blur-3xl" />

        <div className="relative z-10 flex max-w-2xl flex-col items-start gap-6">
          <div className="mb-2 pl-1 pt-1">
            <img
              src={PULSEWISE_LOGO_FULL_URL}
              alt="PulseWise"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl md:leading-[1.1]">
              Pusat Edukasi & Kesehatan Berbasis Klinis
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              Eksplorasi artikel terpercaya untuk gaya hidup sehat Anda.
              Temukan info terbaru seputar medis dan kesehatan jantung.
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/editor/new"
              className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-600/30"
            >
              <Plus
                size={18}
                className="transition-transform group-hover:rotate-90"
              />
              Mulai Menulis
            </Link>
          </div>
        </div>
      </section>

      <section className="sticky top-4 z-30 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
              placeholder="Cari artikel nutrisi, aktivitas, obat..."
              value={query}
              onChange={(event) =>
                updateParams({ q: event.target.value.trim() || null })
              }
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
            <div className="relative min-w-0 sm:min-w-56">
              <select
                value={category}
                onChange={(event) =>
                  updateParams({ category: event.target.value || null })
                }
                className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 pr-11 text-sm font-medium text-slate-700 outline-none transition-all focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
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
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:min-w-30 ${sort === 'latest' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => updateParams({ sort: 'latest' })}
              >
                <Clock size={16} />
                Terbaru
              </button>
              <button
                type="button"
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:min-w-30 ${sort === 'popular' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => updateParams({ sort: 'popular' })}
              >
                <Flame size={16} />
                Populer
              </button>
            </div>
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
        <section className="grid grid-cols-1 gap-6 px-2 sm:grid-cols-2 sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
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

