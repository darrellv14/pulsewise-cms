import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext.jsx';
import { EditorSkeleton } from '../components/AsyncState.jsx';
import { ModalDialog } from '../components/ModalDialog.jsx';
import { ArticleForm } from '../components/ArticleForm.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import {
  createArticle,
  deleteArticle,
  fetchAdminArticleDetail,
  fetchCategories,
  fetchMyArticleDetail,
  submitArticleForReview,
  updateArticle
} from '../lib/educationApi.js';
import { ChevronLeft } from 'lucide-react';

const DEFAULT_TAG_OPTIONS = [
  { tagId: 'default-jantung', slug: 'jantung', name: 'jantung' },
  { tagId: 'default-olahraga', slug: 'olahraga', name: 'olahraga' },
  { tagId: 'default-makanan', slug: 'makanan', name: 'makanan' },
  {
    tagId: 'default-tekanan-darah',
    slug: 'tekanan-darah',
    name: 'tekanan-darah'
  },
  { tagId: 'default-tidur', slug: 'tidur', name: 'tidur' }
];

function normalizeArticlePayload(payload) {
  return {
    title: payload.title,
    excerpt: payload.excerpt,
    categorySlug: payload.categorySlug,
    contentMarkdown: payload.contentMarkdown,
    tags: payload.tags,
    coverImageUrl: payload.coverImageUrl,
    coverImagePublicId: payload.coverImagePublicId
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value || ''
  );
}

function isGhostEditorError(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || '';

  return (
    status === 400 ||
    status === 404 ||
    /tidak ditemukan|not found|validasi request gagal/i.test(message)
  );
}

export function EditorPage({ mode }) {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [article, setArticle] = useState(null);
  const [draftArticleId, setDraftArticleId] = useState(
    mode === 'edit' ? articleId : null
  );
  const draftArticleIdRef = useRef(mode === 'edit' ? articleId : null);
  const createDraftPromiseRef = useRef(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const autosaveMutateAsyncRef = useRef(null);
  const submitMutateAsyncRef = useRef(null);
  const deleteMutateAsyncRef = useRef(null);

  useEffect(() => {
    draftArticleIdRef.current = draftArticleId;
  }, [draftArticleId]);

  const invalidateEducationCollections = () => {
    queryClient.invalidateQueries({ queryKey: ['education', 'my-articles'] });
    queryClient.invalidateQueries({ queryKey: ['education', 'admin-articles'] });
    queryClient.invalidateQueries({
      queryKey: ['education', 'moderation-articles']
    });
    queryClient.invalidateQueries({
      queryKey: ['education', 'moderation-revisions']
    });
  };

  const autosaveMutation = useMutation({
    mutationFn: async (payload) => {
      const currentArticleId = draftArticleIdRef.current;

      if (currentArticleId) {
        return updateArticle(currentArticleId, payload);
      }

      if (!createDraftPromiseRef.current) {
        createDraftPromiseRef.current = createArticle(payload).finally(() => {
          createDraftPromiseRef.current = null;
        });
      }

      const created = await createDraftPromiseRef.current;
      if (created?.articleId) {
        draftArticleIdRef.current = created.articleId;
        return updateArticle(created.articleId, payload);
      }

      return created;
    },
    onSuccess: (result) => {
      if (result?.articleId && result.articleId !== draftArticleId) {
        setDraftArticleId(result.articleId);
      }
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      let targetArticleId = draftArticleId;
      const isPublishedArticle = article?.status === 'published';

      if (!targetArticleId) {
        const created = await createArticle(payload);
        targetArticleId = created.articleId;
        setDraftArticleId(created.articleId);
      } else {
        await updateArticle(targetArticleId, payload);
      }

      if (isPublishedArticle) {
        return { articleId: targetArticleId, kind: 'revision' };
      }

      await submitArticleForReview(targetArticleId);
      return { articleId: targetArticleId, kind: 'article' };
    },
    onSuccess: (result) => {
      invalidateEducationCollections();
      toast.success(
        result.kind === 'revision'
          ? 'Revisi artikel berhasil dikirim ke antrean admin.'
          : 'Artikel berhasil diajukan ke admin untuk direview.'
      );
      navigate('/my-articles', { replace: true });
    },
    onError: (requestError) => {
      const message =
        requestError?.response?.data?.message ||
        'Perubahan artikel gagal dikirim.';
      toast.error(message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      setDeleteDialogOpen(false);
      invalidateEducationCollections();
      toast.success('Artikel berhasil dihapus permanen.');
      navigate('/my-articles', { replace: true });
    },
    onError: (requestError) => {
      const message =
        requestError?.response?.data?.message ||
        'Artikel gagal dihapus permanen.';
      toast.error(message);
    }
  });

  autosaveMutateAsyncRef.current = autosaveMutation.mutateAsync;
  submitMutateAsyncRef.current = submitMutation.mutateAsync;
  deleteMutateAsyncRef.current = deleteMutation.mutateAsync;

  const handleAutosave = useCallback(
    async (payload) =>
      autosaveMutateAsyncRef.current?.(normalizeArticlePayload(payload)),
    []
  );

  const handleSubmitReview = useCallback(
    async (payload) =>
      submitMutateAsyncRef.current?.(normalizeArticlePayload(payload)),
    []
  );

  const handleDelete = useCallback(async () => {
    if (!draftArticleIdRef.current) {
      return;
    }
    await deleteMutateAsyncRef.current?.(draftArticleIdRef.current);
  }, []);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        toast.error('Kategori gagal dimuat.');
      });
  }, []);

  useEffect(() => {
    if (mode !== 'edit') {
      setLoading(false);
      setError(null);
      return;
    }

    if (!articleId || !isUuid(articleId)) {
      setLoading(false);
      setError({ type: 'ghost', message: 'ID artikel tidak valid.' });
      return;
    }

    setLoading(true);
    setError(null);
    setDraftArticleId(articleId);
    const loadArticle =
      user?.role === 'admin' ? fetchAdminArticleDetail : fetchMyArticleDetail;

    loadArticle(articleId)
      .then(setArticle)
      .catch((requestError) => {
        const message =
          requestError?.response?.data?.message || 'Detail draft gagal dimuat.';

        if (isGhostEditorError(requestError)) {
          setError({ type: 'ghost', message });
        } else {
          setError({ type: 'generic', message });
          toast.error(message);
        }
      })
      .finally(() => setLoading(false));
  }, [articleId, mode, user?.role]);

  if (loading) {
    return <EditorSkeleton />;
  }

  if (error?.type === 'ghost') {
    return <NotFoundPage />;
  }

  if (error?.type === 'generic') {
    return <NotFoundPage />;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8">
        <Link
          to="/my-articles"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          Kembali ke Artikel Saya
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <ArticleForm
          categories={categories}
          tagOptions={DEFAULT_TAG_OPTIONS}
          initialValue={article}
          submitPending={submitMutation.isPending}
          archivePending={deleteMutation.isPending}
          showArchiveAction={user?.role === 'admin' && Boolean(draftArticleId)}
          submitLabel={
            article?.status === 'published'
              ? 'Kirim Revisi'
              : article?.status === 'pending_review'
                ? 'Update Pengajuan'
                : 'Ajukan Review'
          }
          submitPendingLabel={
            article?.status === 'published'
              ? 'Mengirim revisi...'
              : article?.status === 'pending_review'
                ? 'Memperbarui pengajuan...'
                : 'Mengirim...'
          }
          onAutosave={handleAutosave}
          onSubmitReview={handleSubmitReview}
          onArchive={() => setDeleteDialogOpen(true)}
        />
      </div>

      <ModalDialog
        open={deleteDialogOpen}
        title="Buang artikel permanen"
        description="Artikel ini akan dihapus permanen dari CMS dan tidak bisa dipulihkan."
        confirmLabel="Buang Permanen"
        confirmTone="danger"
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      >
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          Aksi ini ditujukan untuk admin. Artikel, revisi, komentar, likes, dan
          relasi CMS terkait akan ikut dihapus permanen.
        </div>
      </ModalDialog>
    </div>
  );
}
