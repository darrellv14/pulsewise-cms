import { Heart, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ArticleCard({ article }) {
  return (
    <Link
      className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-pulse/20 transition-all overflow-hidden group h-full"
      to={`/articles/${article.slug}`}
    >
      <div className="relative w-full pb-[56.25%] bg-slate-100 shrink-0 overflow-hidden">
        {article.coverImageUrl ? (
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
            <span className="font-medium">No Image</span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur text-pulse text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm">
            {article.category?.name || 'Umum'}
          </span>
          {article.isFeatured && (
            <span className="bg-amber-400 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
              <Star size={12} className="fill-white" /> Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-slate-900 leading-snug mb-2 group-hover:text-pulse transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-y-3 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pulse/10 text-pulse flex items-center justify-center font-bold text-xs">
              {(article.author?.displayName || 'U')[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {article.author?.displayName}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {article.author?.badge ||
                  article.author?.role?.replace('_', ' ') ||
                  'User'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1 group-hover:text-pulse transition-colors">
              <Heart
                size={14}
                className={article.likedByMe ? 'fill-pulse text-pulse' : ''}
              />
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
