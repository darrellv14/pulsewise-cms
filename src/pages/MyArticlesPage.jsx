import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  FilePenLine
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ErrorState, InlineLoader } from '../components/AsyncState.jsx';
import { fetchMyArticles } from '../lib/educationApi.js';
import { educationKeys } from '../lib/queryKeys.js';

const STATUS_TABS = [
  { id: 'draft', label: 'Draft' },
  { id: 'pending_review', label: 'Menunggu Review' },
  { id: 'published', label: 'Published' },
  { id: 'rejected', label: 'Ditolak' }
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'published':
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
          <CheckCircle2 size={12} /> Published
        </span>
      );
    case 'pending_review':
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
          <Clock size={12} /> Pending
        </span>
      );
    case 'rejected':
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
          <AlertCircle size={12} /> Ditolak
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
          <Edit2 size={12} /> Draft
        </span>
      );
  }
};

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function MyArticlesPage() {
  const [status, setStatus] = useState('draft');

  const query = useQuery({
    queryKey: educationKeys.myArticles({ status, page: 1, limit: 10 }),
    queryFn: () => fetchMyArticles({ page: 1, limit: 10, status })
  });

  useEffect(() => {
    if (query.error) {
      toast.error(
        getErrorMessage(query.error, 'Daftar artikel saya gagal dimuat.')
      );
    }
  }, [query.error]);

  const state = query.data || { items: [], pagination: {} };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Artikel Saya</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola publikasi dan kontribusi edukasi Anda.
          </p>
        </div>
        <Link
          to="/editor/new"
          className="inline-flex items-center justify-center gap-2 bg-pulse hover:bg-pulse-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-pulse"
        >
          <Plus size={18} />
          Tulis Artikel
        </Link>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatus(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                status === tab.id
                  ? 'border-pulse text-pulse'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {query.isLoading ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex justify-center">
          <InlineLoader label="Memuat artikel..." />
        </div>
      ) : query.isError ? (
        <ErrorState
          title="Gagal memuat"
          message={getErrorMessage(
            query.error,
            'Daftar artikel saya gagal dimuat.'
          )}
        />
      ) : state.items.length ? (
        <div className="flex flex-col gap-4">
          <div className="md:hidden space-y-4">
            {state.items.map((article) => (
              <div
                key={article.articleId}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3"
              >
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                    {article.coverImageUrl ? (
                      <img
                        src={article.coverImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-slate-300" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-pulse bg-pulse/10 px-2 py-0.5 rounded-md truncate">
                        {article.category?.name || 'Umum'}
                      </span>
                      {getStatusBadge(article.status)}
                    </div>
                    <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm">
                      {article.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {new Date(
                      article.updatedAt || article.createdAt
                    ).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/editor/${article.articleId}`}
                      className="p-2 text-slate-400 hover:text-pulse bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Artikel
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Terakhir Diperbarui
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.items.map((article) => (
                  <tr
                    key={article.articleId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                          {article.coverImageUrl ? (
                            <img
                              src={article.coverImageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-slate-300" size={20} />
                          )}
                        </div>
                        <p className="font-semibold text-slate-800 text-sm max-w-sm truncate">
                          {article.title}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-pulse bg-pulse/10 px-2.5 py-1 rounded-md capitalize">
                        {article.category?.name || 'Umum'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(article.status)}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(
                        article.updatedAt || article.createdAt
                      ).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/editor/${article.articleId}`}
                          className="p-2 text-slate-400 hover:text-pulse bg-white hover:bg-pulse/5 border border-slate-200 hover:border-pulse/20 rounded-lg transition-all shadow-sm"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FilePenLine size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            Belum ada artikel
          </h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            Anda belum memiliki artikel pada status ini. Mulai bagikan
            pengetahuan Anda sekarang.
          </p>
          <Link
            to="/editor/new"
            className="inline-flex items-center justify-center gap-2 bg-pulse hover:bg-pulse-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            Mulai Menulis
          </Link>
        </div>
      )}
    </div>
  );
}
