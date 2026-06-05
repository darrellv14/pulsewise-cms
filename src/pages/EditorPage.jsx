import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EditorSkeleton } from '../components/AsyncState.jsx';
import { ArticleForm } from '../components/ArticleForm.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import {
  createArticle,
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
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [article, setArticle] = useState(null);
  const [draftArticleId, setDraftArticleId] = useState(
    mode === 'edit' ? articleId : null
  );
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState(null);

  const invalidateEducationCollections = () => {
    queryClient.invalidateQueries({ queryKey: ['education', 'my-articles'] });
    queryClient.invalidateQueries({
      queryKey: ['education', 'moderation-articles']
    });
    queryClient.invalidateQueries({
      queryKey: ['education', 'moderation-revisions']
    });
  };

  const autosaveMutation = useMutation({
    mutationFn: async (payload) => {
      if (draftArticleId) {
        return updateArticle(draftArticleId, payload);
      }
      return createArticle(payload);
    },
    onSuccess: (result) => {
      if (result?.articleId && result.articleId !== draftArticleId) {
        setDraftArticleId(result.articleId);
        setArticle((current) => current || result);
        navigate(`/editor/${result.articleId}`, { replace: true });
      }
      invalidateEducationCollections();
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      let targetArticleId = draftArticleId;

      if (!targetArticleId) {
        const created = await createArticle(payload);
        targetArticleId = created.articleId;
        setDraftArticleId(created.articleId);
      } else {
        await updateArticle(targetArticleId, payload);
      }

      await submitArticleForReview(targetArticleId);
      return targetArticleId;
    },
    onSuccess: () => {
      invalidateEducationCollections();
      toast.success('Artikel berhasil diajukan ke admin untuk direview.');
      navigate('/my-articles', { replace: true });
    },
    onError: (requestError) => {
      toast.error(
        requestError?.response?.data?.message ||
          'Artikel gagal diajukan untuk review.'
      );
    }
  });

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
    fetchMyArticleDetail(articleId)
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
  }, [articleId, mode]);

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
          onAutosave={async (payload) => {
            const normalized = {
              title: payload.title,
              excerpt: payload.excerpt,
              categorySlug: payload.categorySlug,
              contentMarkdown: payload.contentMarkdown,
              tags: payload.tags,
              coverImageUrl: payload.coverImageUrl,
              coverImagePublicId: payload.coverImagePublicId
            };

            return autosaveMutation.mutateAsync(normalized);
          }}
          onSubmitReview={async (payload) => {
            const normalized = {
              title: payload.title,
              excerpt: payload.excerpt,
              categorySlug: payload.categorySlug,
              contentMarkdown: payload.contentMarkdown,
              tags: payload.tags,
              coverImageUrl: payload.coverImageUrl,
              coverImagePublicId: payload.coverImagePublicId
            };

            return submitMutation.mutateAsync(normalized);
          }}
        />
      </div>
    </div>
  );
}