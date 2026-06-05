import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ErrorState, InlineLoader } from '../components/AsyncState.jsx';
import { MdxContent } from '../components/MdxContent.jsx';
import {
  approveArticle,
  approveRevision,
  fetchAdminArticleDetail,
  fetchPendingArticles,
  fetchPendingRevisions,
  rejectArticle,
  rejectRevision
} from '../lib/educationApi.js';
import { ArrowRight, Eye, ShieldCheck, X } from 'lucide-react';
import { educationKeys } from '../lib/queryKeys.js';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) =>
      typeof tag === 'string' ? tag.trim() : tag?.slug || tag?.name || ''
    )
    .filter(Boolean);
}

function tagsEqual(left, right) {
  const a = normalizeTags(left).sort().join('|');
  const b = normalizeTags(right).sort().join('|');
  return a === b;
}

function DiffField({ label, before, after, changed, type = 'text' }) {
  const renderValue = (value) => {
    if (type === 'tags') {
      const tags = normalizeTags(value);
      if (!tags.length) {
        return <span className="text-slate-400 text-sm">Tidak ada tag</span>;
      }
      return (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      );
    }

    if (type === 'image') {
      if (!value) {
        return <span className="text-slate-400 text-sm">Tidak ada cover</span>;
      }
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt={label}
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      );
    }

    return (
      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {normalizeText(value) || '-'}
      </p>
    );
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${changed ? 'border-pulse/30 bg-pulse/5' : 'border-slate-200 bg-white'}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-slate-900">{label}</h4>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${changed ? 'bg-pulse text-white' : 'bg-slate-100 text-slate-500'}`}
        >
          {changed ? 'Berubah' : 'Sama'}
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Sebelum
          </p>
          {renderValue(before)}
        </div>
        <div className="hidden items-center justify-center text-slate-300 lg:flex">
          <ArrowRight size={18} />
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-600">
            Setelah
          </p>
          {renderValue(after)}
        </div>
      </div>
    </div>
  );
}

function SubmissionPreview({ detail }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
              Artikel Baru
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {detail.title}
            </h3>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              {detail.excerpt || 'Belum ada ringkasan.'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Kategori:</span>{' '}
              {detail.category?.name || 'Belum dipilih'}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Penulis:</span>{' '}
              {detail.author?.displayName ||
                detail.author?.username ||
                'Kontributor'}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">Dikirim:</span>{' '}
              {formatDate(detail.updatedAt || detail.createdAt)}
            </p>
          </div>
        </div>
      </section>

      {detail.coverImageUrl ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <img
            src={detail.coverImageUrl}
            alt={detail.title}
            className="aspect-[16/8] w-full object-cover"
          />
        </div>
      ) : null}

      {detail.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {detail.tags.map((tag) => (
            <span
              key={tag.slug}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
          Preview Konten
        </h4>
        <MdxContent source={detail.contentMarkdown} />
      </div>
    </div>
  );
}

function RevisionDiffPreview({ currentArticle, revision }) {
  const fields = [
    {
      key: 'title',
      label: 'Judul',
      before: currentArticle?.title,
      after: revision?.title,
      changed:
        normalizeText(currentArticle?.title) !== normalizeText(revision?.title)
    },
    {
      key: 'excerpt',
      label: 'Ringkasan',
      before: currentArticle?.excerpt,
      after: revision?.excerpt,
      changed:
        normalizeText(currentArticle?.excerpt) !==
        normalizeText(revision?.excerpt)
    },
    {
      key: 'category',
      label: 'Kategori',
      before: currentArticle?.category?.name,
      after: revision?.category?.name,
      changed:
        normalizeText(
          currentArticle?.category?.slug || currentArticle?.category?.name
        ) !==
        normalizeText(revision?.category?.slug || revision?.category?.name)
    },
    {
      key: 'tags',
      label: 'Tags',
      before: currentArticle?.tags,
      after: revision?.tagSlugs,
      changed: !tagsEqual(currentArticle?.tags, revision?.tagSlugs),
      type: 'tags'
    },
    {
      key: 'cover',
      label: 'Cover',
      before: currentArticle?.coverImageUrl,
      after: revision?.coverImageUrl,
      changed:
        normalizeText(currentArticle?.coverImageUrl) !==
        normalizeText(revision?.coverImageUrl),
      type: 'image'
    },
    {
      key: 'content',
      label: 'Konten Artikel',
      before: currentArticle?.contentMarkdown,
      after: revision?.contentMarkdown,
      changed:
        normalizeText(currentArticle?.contentMarkdown) !==
        normalizeText(revision?.contentMarkdown)
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
              Revisi Artikel
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {currentArticle?.title}
            </h3>
            <p className="max-w-3xl text-sm leading-6 text-slate-500">
              Admin bisa membandingkan versi live sekarang dengan perubahan yang
              diajukan penulis.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Penulis:</span>{' '}
              {currentArticle?.author?.displayName || 'Kontributor'}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">
                Live terakhir:
              </span>{' '}
              {formatDate(
                currentArticle?.updatedAt ||
                  currentArticle?.publishedAt ||
                  currentArticle?.createdAt
              )}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-900">
                Revisi diajukan:
              </span>{' '}
              {formatDate(revision?.submittedAt || revision?.createdAt)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {fields.map((field) => (
          <DiffField key={field.key} {...field} />
        ))}
      </div>
    </div>
  );
}

function ModerationPreviewModal({ item, detail, isLoading, onClose }) {
  if (!item) return null;

  const revision = detail?.pendingRevision || item;
  const isRevision = item._type === 'Revisi';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-pulse">
              Moderation Review
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              {isRevision
                ? 'Lihat perubahan revisi'
                : 'Lihat detail artikel baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-pulse/30 hover:text-pulse"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <InlineLoader label="Menyiapkan preview moderasi..." />
          ) : detail ? (
            isRevision ? (
              <RevisionDiffPreview
                currentArticle={detail}
                revision={revision}
              />
            ) : (
              <SubmissionPreview detail={detail} />
            )
          ) : (
            <ErrorState
              title="Preview belum tersedia"
              message="Detail artikel tidak berhasil dimuat untuk sesi moderasi ini."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ModerationPage() {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);

  const pendingArticlesQuery = useQuery({
    queryKey: educationKeys.moderationArticles({ page: 1, limit: 20 }),
    queryFn: () => fetchPendingArticles({ page: 1, limit: 20 })
  });

  const pendingRevisionsQuery = useQuery({
    queryKey: educationKeys.moderationRevisions({ page: 1, limit: 20 }),
    queryFn: () => fetchPendingRevisions({ page: 1, limit: 20 })
  });

  const moderationDetailQuery = useQuery({
    queryKey: ['education', 'moderation-detail', selectedItem?.articleId],
    queryFn: () => fetchAdminArticleDetail(selectedItem.articleId),
    enabled: Boolean(selectedItem?.articleId)
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

  useEffect(() => {
    if (moderationDetailQuery.error) {
      toast.error(
        getErrorMessage(
          moderationDetailQuery.error,
          'Detail moderasi gagal dimuat.'
        )
      );
    }
  }, [moderationDetailQuery.error]);

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
    if (selectedItem?.articleId) {
      queryClient.invalidateQueries({
        queryKey: ['education', 'moderation-detail', selectedItem.articleId]
      });
    }
  };

  const approveMutation = useMutation({
    mutationFn: async (item) =>
      item._type === 'Revisi'
        ? approveRevision(item._id)
        : approveArticle(item._id),
    onSuccess: (_data, item) => {
      toast.success(`${item._type} berhasil di-approve.`);
      invalidateModeration();
      setSelectedItem(null);
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
      setSelectedItem(null);
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
    <>
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
              Admin sekarang bisa melihat isi artikel baru secara penuh dan
              membandingkan revisi sebelum approve.
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
                      {formatDate(item.createdAt || item.updatedAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-pulse/30 hover:text-pulse"
                        >
                          <Eye size={15} /> Review
                        </button>
                        <button
                          onClick={() => approveMutation.mutate(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-pulse/10 text-pulse hover:bg-pulse hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
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
                            approveMutation.isPending ||
                            rejectMutation.isPending
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

      <ModerationPreviewModal
        item={selectedItem}
        detail={moderationDetailQuery.data}
        isLoading={moderationDetailQuery.isLoading}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}


