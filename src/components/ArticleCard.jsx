import { Heart, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

function resolveAvatar(author) {
  return author?.avatarPhoto || author?.avatarUrl || author?.avatar || null;
}

function getInitials(value, fallback = 'U') {
  return (value || fallback).trim()[0]?.toUpperCase() || fallback;
}

export function ArticleCard({ article }) {
  const authorName = article.author?.displayName || 'Tim Kontributor';
  const authorBadge = article.author?.badge || 'Kontributor';
  const coverImage = article.coverImageUrl;
  const avatarUrl = resolveAvatar(article.author);

  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group h-full bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-pulse/10 to-pulse/20 flex items-center justify-center text-pulse font-semibold text-sm px-6 text-center">
            PulseWise Education
          </div>
        )}

        {article.isFeatured && (
          <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/95 text-amber-500 px-3 py-1 text-xs font-bold shadow-sm">
            <Star size={12} className="fill-amber-400" /> Featured
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/45 to-transparent pointer-events-none"></div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-pulse/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pulse">
            {article.category?.name || 'Umum'}
          </span>
          {article.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag.slug}
              className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-pulse transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-500 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-y-3 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-pulse/10 text-pulse flex items-center justify-center font-bold text-xs shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(authorName, 'U')
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 leading-tight truncate">
                {authorName}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {authorBadge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1 group-hover:text-pulse transition-colors">
              <Heart size={14} />
              {article.likeCount}
            </span>
            <span className="flex items-center gap-1 group-hover:text-pulse transition-colors">
              <MessageCircle size={14} />
              {article.commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}