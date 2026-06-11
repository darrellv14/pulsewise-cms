import {
  ArrowLeft,
  Calendar,
  Heart,
  MessageCircle,
  ShieldCheck,
  User
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  EmptyState,
  ErrorState,
  InlineLoader
} from '../components/AsyncState.jsx';
import { CommentThread } from '../components/CommentThread.jsx';
import { MdxContent } from '../components/MdxContent.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import {
  deleteComment,
  fetchArticleBySlug,
  fetchComments,
  hideComment,
  postComment,
  postReply,
  toggleLike,
  updateComment
} from '../lib/educationApi.js';
import { educationKeys } from '../lib/queryKeys.js';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function buildAuthorMeta(author) {
  const displayName =
    author?.displayName ||
    author?.name ||
    author?.username ||
    'Tim Kontributor';
  const avatarUrl =
    author?.avatarPhoto || author?.avatarUrl || author?.avatar || null;
  const role = author?.role || 'patient';
  const roleLabel =
    author?.badge ||
    (role === 'doctor' ? 'Dokter' : role === 'admin' ? 'Admin' : 'Pasien');
  return { displayName, avatarUrl, role, roleLabel };
}

function isGhostArticleError(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || '';

  return status === 404 || /tidak ditemukan|not found/i.test(message);
}

function getInitials(value, fallback = 'U') {
  return (value || fallback).trim()[0]?.toUpperCase() || fallback;
}

export function ArticleDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentDraft, setCommentDraft] = useState('');
  const [busyAction, setBusyAction] = useState('');

  const currentAuthor = useMemo(() => {
    const name =
      [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
      user?.username ||
      user?.email ||
      'Anda';
    const badge =
      user?.role === 'doctor'
        ? 'Dokter'
        : user?.role === 'admin'
          ? 'Admin'
          : 'Pasien';
    return {
      role: user?.role || 'patient',
      displayName: name,
      badge,
      avatarPhoto: user?.avatarPhoto || user?.avatarUrl || user?.avatar || null
    };
  }, [user]);

  const articleQuery = useQuery({
    queryKey: educationKeys.articleDetail(slug),
    queryFn: () => fetchArticleBySlug(slug),
    enabled: Boolean(slug)
  });

  const article = articleQuery.data;

  const commentsQuery = useQuery({
    queryKey: educationKeys.articleComments(article?.articleId || 'unknown'),
    queryFn: () => fetchComments(article.articleId, { limit: 20 }),
    enabled: Boolean(article?.articleId)
  });

  useEffect(() => {
    if (articleQuery.error && !isGhostArticleError(articleQuery.error)) {
      toast.error(
        getErrorMessage(articleQuery.error, 'Detail artikel gagal dimuat.')
      );
    }
  }, [articleQuery.error]);

  useEffect(() => {
    if (commentsQuery.error) {
      toast.error(
        getErrorMessage(commentsQuery.error, 'Komentar gagal dimuat.')
      );
    }
  }, [commentsQuery.error]);

  const updateArticleCache = (updater) => {
    queryClient.setQueryData(educationKeys.articleDetail(slug), (current) =>
      current ? updater(current) : current
    );
  };

  const updateCommentsCache = (updater) => {
    if (!article?.articleId) return;
    queryClient.setQueryData(
      educationKeys.articleComments(article.articleId),
      (current) => {
        const base = current || { items: [], pagination: { hasMore: false } };
        return updater(base);
      }
    );
  };

  const likeMutation = useMutation({
    mutationFn: ({ articleId, liked }) => toggleLike(articleId, liked),
    onMutate: async ({ liked }) => {
      const previous = queryClient.getQueryData(
        educationKeys.articleDetail(slug)
      );
      updateArticleCache((current) => ({
        ...current,
        likedByMe: !current.likedByMe,
        likeCount: liked ? current.likeCount - 1 : current.likeCount + 1
      }));
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          educationKeys.articleDetail(slug),
          context.previous
        );
      }
      toast.error(getErrorMessage(error, 'Aksi like gagal.'));
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ articleId, content }) => postComment(articleId, content),
    onSuccess: (createdComment) => {
      const nextComment = {
        replies: [],
        canEdit: true,
        canDelete: true,
        author: currentAuthor,
        status: 'visible',
        ...createdComment
      };
      updateCommentsCache((current) => ({
        ...current,
        items: [nextComment, ...current.items]
      }));
      updateArticleCache((current) => ({
        ...current,
        commentCount: Math.max(0, Number(current.commentCount || 0) + 1)
      }));
      setCommentDraft('');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Komentar gagal dikirim.'));
    }
  });

  const replyMutation = useMutation({
    mutationFn: ({ commentId, content }) => postReply(commentId, content),
    onSuccess: (createdReply, variables) => {
      const nextReply = {
        canEdit: true,
        canDelete: true,
        author: currentAuthor,
        status: 'visible',
        ...createdReply
      };
      updateCommentsCache((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.commentId === variables.commentId
            ? { ...item, replies: [...(item.replies || []), nextReply] }
            : item
        )
      }));
      updateArticleCache((current) => ({
        ...current,
        commentCount: Math.max(0, Number(current.commentCount || 0) + 1)
      }));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Balasan gagal dikirim.'));
    }
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }) => updateComment(commentId, content),
    onSuccess: (_data, variables) => {
      updateCommentsCache((current) => ({
        ...current,
        items: current.items.map((item) => {
          if (item.commentId === variables.commentId) {
            return { ...item, content: variables.content };
          }
          return {
            ...item,
            replies: (item.replies || []).map((reply) =>
              reply.commentId === variables.commentId
                ? { ...reply, content: variables.content }
                : reply
            )
          };
        })
      }));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Komentar gagal diperbarui.'));
    }
  });

  const removeCommentMutation = useMutation({
    mutationFn: ({ type, commentId }) =>
      type === 'hide' ? hideComment(commentId) : deleteComment(commentId),
    onSuccess: (_data, variables) => {
      let removed = 0;
      updateCommentsCache((current) => ({
        ...current,
        items: current.items
          .filter((item) => {
            if (item.commentId === variables.commentId) {
              removed += 1 + (item.replies?.length || 0);
              return false;
            }
            return true;
          })
          .map((item) => {
            const replies = (item.replies || []).filter((reply) => {
              if (reply.commentId === variables.commentId) {
                removed += 1;
                return false;
              }
              return true;
            });
            return { ...item, replies };
          })
      }));
      updateArticleCache((current) => ({
        ...current,
        commentCount: Math.max(0, Number(current.commentCount || 0) - removed)
      }));
    },
    onError: (error, variables) => {
      toast.error(
        getErrorMessage(
          error,
          variables.type === 'hide'
            ? 'Komentar gagal disembunyikan.'
            : 'Komentar gagal dihapus.'
        )
      );
    }
  });

  if (articleQuery.isLoading) {
    return (
      <div className="flex-1 flex justify-center p-12">
        <InlineLoader label="Memuat detail artikel..." />
      </div>
    );
  }

  if (articleQuery.isError && isGhostArticleError(articleQuery.error)) {
    return <NotFoundPage />;
  }

  if (articleQuery.isError) {
    return (
      <div className="p-4 sm:p-8">
        <ErrorState
          title="Detail artikel belum tersedia"
          message={getErrorMessage(
            articleQuery.error,
            'Detail artikel gagal dimuat.'
          )}
          actionLabel="Muat ulang"
          onAction={() => articleQuery.refetch()}
        />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-4 sm:p-8">
        <EmptyState
          title="Artikel tidak ditemukan"
          message="Slug ini belum punya artikel published."
        />
      </div>
    );
  }

  const authorMeta = buildAuthorMeta(article.author);
  const commentsState = commentsQuery.data || {
    items: [],
    pagination: { hasMore: false }
  };

  return (
    <div className="mx-auto max-w-3xl px-0 pb-16 sm:px-6 sm:pb-24">
      <div className="mb-4 mt-4 px-4 sm:mt-8 sm:px-0">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-pulse/30 hover:text-pulse"
        >
          <ArrowLeft size={17} />
          Kembali ke Beranda Edukasi
        </Link>
      </div>

      <article className="mb-6 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm sm:mb-8 sm:rounded-2xl">
        {article.coverImageUrl && (
          <div className="relative aspect-[16/10] w-full sm:h-96">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6 p-4 sm:space-y-8 sm:p-10">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-pulse bg-pulse/10 font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full">
                {article.category?.name || 'Umum'}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 pt-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 sm:pb-6">
              <div className="flex min-w-0 items-center gap-3 font-medium text-slate-700">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-pulse/10 text-pulse flex items-center justify-center">
                  {authorMeta.avatarUrl ? (
                    <img
                      src={authorMeta.avatarUrl}
                      alt={authorMeta.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div>
                  <div>{authorMeta.displayName}</div>
                  <div className="text-xs text-slate-500">
                    {authorMeta.roleLabel}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                <ShieldCheck size={16} className="text-slate-400" />
                <span>{authorMeta.roleLabel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-400" />
                <span>
                  {new Date(
                    article.publishedAt || article.createdAt
                  ).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </header>

          <main className="min-h-50 overflow-hidden">
            <MdxContent source={article.contentMarkdown} />
          </main>

          <footer className="space-y-5 border-t border-slate-100 pt-6">
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-slate-500 py-1 mr-2">
                  Tags:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag.slug}
                    className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <button
                  onClick={() => {
                    setBusyAction('like');
                    likeMutation.mutate(
                      {
                        articleId: article.articleId,
                        liked: article.likedByMe
                      },
                      { onSettled: () => setBusyAction('') }
                    );
                  }}
                  disabled={busyAction === 'like'}
                  className={`flex flex-1 items-center gap-2 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-pulse/50 ${article.likedByMe ? 'text-pulse' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Heart
                    size={24}
                    className={`transition-all ${article.likedByMe ? 'fill-pulse' : 'scale-100'}`}
                  />
                  <span className="text-sm sm:text-base">{article.likeCount} Suka</span>
                </button>
                <div className="flex items-center gap-2 rounded-xl px-0 text-sm font-medium text-slate-500 sm:px-4">
                  <MessageCircle size={24} />
                  <span className="text-sm sm:text-base">
                    {article.commentCount} Komentar
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </article>

      <section
        className="space-y-6 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm sm:space-y-8 sm:rounded-2xl sm:p-10"
        id="comments"
      >
        <div>
          <h2 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {article.commentCount} Komentar
          </h2>
          <p className="text-slate-500 text-sm">
            Bagikan tanggapan atau pertanyaan Anda tentang artikel ini.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-pulse text-white flex items-center justify-center font-bold text-sm shrink-0">
              {currentAuthor.avatarPhoto ? (
                <img
                  src={currentAuthor.avatarPhoto}
                  alt={currentAuthor.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(user?.username || user?.firstName || 'A', 'A')
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                rows={3}
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Tulis komentar Anda..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse resize-none shadow-sm"
              />
              <div className="flex justify-end sm:justify-end">
                <button
                  type="button"
                  className="w-full rounded-xl bg-pulse px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-pulse-dark disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                  onClick={() => {
                    if (!commentDraft.trim()) {
                      toast.error('Komentar tidak boleh kosong.');
                      return;
                    }
                    setBusyAction('comment');
                    addCommentMutation.mutate(
                      { articleId: article.articleId, content: commentDraft },
                      { onSettled: () => setBusyAction('') }
                    );
                  }}
                  disabled={busyAction === 'comment'}
                >
                  {busyAction === 'comment' ? 'Mengirim...' : 'Kirim Komentar'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {commentsQuery.isLoading ? (
          <InlineLoader label="Memuat komentar..." />
        ) : (
          <div className="mt-8">
            <CommentThread
              comments={commentsState.items}
              isAdmin={user?.role === 'admin'}
              onReply={(commentId, content) => {
                if (!content.trim()) {
                  toast.error('Balasan tidak boleh kosong.');
                  return;
                }
                replyMutation.mutate({ commentId, content });
              }}
              onUpdate={(commentId, content) => {
                if (!content.trim()) {
                  toast.error('Komentar tidak boleh kosong.');
                  return;
                }
                updateCommentMutation.mutate({ commentId, content });
              }}
              onDelete={(commentId) => {
                removeCommentMutation.mutate({ type: 'delete', commentId });
              }}
              onHide={(commentId) => {
                removeCommentMutation.mutate({ type: 'hide', commentId });
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}

