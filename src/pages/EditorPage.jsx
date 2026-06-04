import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ErrorState, InlineLoader } from '../components/AsyncState.jsx';
import { ArticleForm } from '../components/ArticleForm.jsx';
import {
  createArticle,
  fetchCategories,
  fetchMyArticleDetail,
  fetchTags,
  submitArticleForReview,
  updateArticle
} from '../lib/educationApi.js';
import { ChevronLeft } from 'lucide-react';

export function EditorPage({ mode }) {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [categories, setCategories] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchCategories(), fetchTags()])
      .then(([categoryData, tagData]) => {
        setCategories(categoryData);
        setTagOptions(tagData);
      })
      .catch(() => {
        toast.error('Kategori atau tag gagal dimuat.');
      });
  }, []);

  useEffect(() => {
    if (mode === 'edit' && articleId) {
      setLoading(true);
      setError('');
      fetchMyArticleDetail(articleId)
        .then(setArticle)
        .catch((requestError) => {
          const message =
            requestError?.response?.data?.message ||
            'Detail draft gagal dimuat.';
          setError(message);
          toast.error(message);
        })
        .finally(() => setLoading(false));
    }
  }, [articleId, mode]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center p-12">
        <InlineLoader label="Menyiapkan editor artikel..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState title="Editor belum siap" message={error} />
      </div>
    );
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
          tagOptions={tagOptions}
          initialValue={article}
          submitLabel={mode === 'create' ? 'Simpan Draft' : 'Simpan Perubahan'}
          onSave={async (payload) => {
            const normalized = {
              title: payload.title,
              excerpt: payload.excerpt,
              categorySlug: payload.categorySlug,
              contentMarkdown: payload.contentMarkdown,
              tags: payload.tags,
              coverImageUrl: payload.coverImageUrl,
              coverImagePublicId: payload.coverImagePublicId
            };

            const result =
              mode === 'create'
                ? await createArticle(normalized)
                : await updateArticle(articleId, normalized);

            toast.success(
              mode === 'create'
                ? 'Draft berhasil dibuat.'
                : 'Perubahan draft tersimpan.'
            );
            navigate(`/editor/${result.articleId || articleId}`);
          }}
          onSubmitReview={async () => {
            const targetArticleId = article?.articleId || articleId;
            if (!targetArticleId) {
              toast.error('Simpan draft dulu sebelum ajukan review.');
              return;
            }
            await submitArticleForReview(targetArticleId);
            toast.success('Artikel berhasil diajukan untuk review.');
            const refreshed = await fetchMyArticleDetail(targetArticleId);
            setArticle(refreshed);
          }}
        />
      </div>
    </div>
  );
}
