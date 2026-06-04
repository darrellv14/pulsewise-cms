import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ErrorState, InlineLoader } from '../components/AsyncState.jsx';
import {
  approveArticle,
  approveRevision,
  fetchPendingArticles,
  fetchPendingRevisions,
  rejectArticle,
  rejectRevision
} from '../lib/educationApi.js';
import { ShieldCheck } from 'lucide-react';
import { educationKeys } from '../lib/queryKeys.js';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function ModerationPage() {
  const queryClient = useQueryClient();

  const pendingArticlesQuery = useQuery({
    queryKey: educationKeys.moderationArticles({ page: 1, limit: 20 }),
    queryFn: () => fetchPendingArticles({ page: 1, limit: 20 })
  });

  const pendingRevisionsQuery = useQuery({
    queryKey: educationKeys.moderationRevisions({ page: 1, limit: 20 }),
    queryFn: () => fetchPendingRevisions({ page: 1, limit: 20 })
  });

  useEffect(() => {
    if (pendingArticlesQuery.error) {
      toast.error(
        getErrorMessage(
          pendingArticlesQuery.error,
          'Queue artikel gagal dimuat.'
        )
      );
    }
  }, [pendingArticlesQuery.error]);

  useEffect(() => {
    if (pendingRevisionsQuery.error) {
      toast.error(
        getErrorMessage(
          pendingRevisionsQuery.error,
          'Queue revisi gagal dimuat.'
        )
      );
    }
  }, [pendingRevisionsQuery.error]);

  const queue = useMemo(() => {
    const pendingArticles = pendingArticlesQuery.data?.items || [];
    const pendingRevisions = pendingRevisionsQuery.data?.items || [];
    return [
      ...pendingArticles.map((item) => ({
        ...item,
        _type: 'Artikel Baru',
        _id: item.articleId
      })),
      ...pendingRevisions.map((item) => ({
        ...item,
        _type: 'Revisi',
        _id: item.revisionId
      }))
    ].sort(
      (a, b) =>
        new Date(b.createdAt || b.updatedAt) -
        new Date(a.createdAt || a.updatedAt)
    );
  }, [pendingArticlesQuery.data, pendingRevisionsQuery.data]);

  const invalidateModeration = () => {
    queryClient.invalidateQueries({
      queryKey: educationKeys.moderationArticles({ page: 1, limit: 20 })
    });
    queryClient.invalidateQueries({
      queryKey: educationKeys.moderationRevisions({ page: 1, limit: 20 })
    });
  };

  const approveMutation = useMutation({
    mutationFn: async (item) =>
      item._type === 'Revisi'
        ? approveRevision(item._id)
        : approveArticle(item._id),
    onSuccess: (_data, item) => {
      toast.success(`${item._type} berhasil di-approve.`);
      invalidateModeration();
    },
    onError: (error, item) => {
      toast.error(
        getErrorMessage(error, `Gagal menyetujui ${item._type.toLowerCase()}.`)
      );
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ item, reason }) =>
      item._type === 'Revisi'
        ? rejectRevision(item._id, reason)
        : rejectArticle(item._id, reason),
    onSuccess: (_data, { item }) => {
      toast.success(`${item._type} ditolak dengan catatan.`);
      invalidateModeration();
    },
    onError: (error, { item }) => {
      toast.error(
        getErrorMessage(error, `Gagal menolak ${item._type.toLowerCase()}.`)
      );
    }
  });

  if (pendingArticlesQuery.isLoading || pendingRevisionsQuery.isLoading) {
    return (
      <div className="flex-1 flex justify-center p-12">
        <InlineLoader label="Memuat antrean moderasi..." />
      </div>
    );
  }

  if (pendingArticlesQuery.isError || pendingRevisionsQuery.isError) {
    return (
      <div className="p-8">
        <ErrorState
          title="Moderasi belum tersedia"
          message={getErrorMessage(
            pendingArticlesQuery.error || pendingRevisionsQuery.error,
            'Queue moderasi gagal dimuat.'
          )}
          actionLabel="Coba lagi"
          onAction={() => {
            pendingArticlesQuery.refetch();
            pendingRevisionsQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Queue Moderasi
            </h1>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-md">
              {queue.length} Menunggu
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Setujui atau tolak artikel baru dan revisi kontributor.
          </p>
        </div>
      </div>

      {queue.length ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Judul & Author
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipe Antrean
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tanggal Submit
                </th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Oleh:{' '}
                      {item.author?.displayName ||
                        item.author?.name ||
                        'Kontributor'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${item._type === 'Revisi' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                      {item._type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">
                    {new Date(
                      item.createdAt || item.updatedAt
                    ).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => approveMutation.mutate(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-pulse/10 text-pulse hover:bg-pulse hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt(
                            `Alasan penolakan ${item._type.toLowerCase()}:`,
                            'Perlu perbaikan redaksional'
                          );
                          if (!reason) return;
                          rejectMutation.mutate({ item, reason });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-200 disabled:opacity-60"
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            Antrean Bersih
          </h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto">
            Semua artikel dan revisi telah berhasil direview. Pekerjaan Anda
            selesai untuk saat ini.
          </p>
        </div>
      )}
    </div>
  );
}
