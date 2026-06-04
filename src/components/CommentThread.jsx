import { MessageSquareReply, Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export function CommentThread({
  comments,
  onReply,
  onUpdate,
  onDelete,
  onHide,
  isAdmin
}) {
  if (!comments?.length) return null;
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.commentId}
          comment={comment}
          onReply={onReply}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onHide={onHide}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}

function CommentCard({
  comment,
  onReply,
  onUpdate,
  onDelete,
  onHide,
  isAdmin
}) {
  const [draftReply, setDraftReply] = useState('');
  const [draftEdit, setDraftEdit] = useState(comment.content);
  const [mode, setMode] = useState(null);

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">
      {/* Head */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pulse text-white flex items-center justify-center font-bold text-xs shrink-0">
            {(comment.author?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm text-slate-800">
                {comment.author?.displayName || 'User'}
              </strong>
              {(comment.author?.badge || comment.author?.role) && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 uppercase tracking-widest">
                  {comment.author.badge || comment.author.role}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
          <button
            title="Balas"
            onClick={() => setMode(mode === 'reply' ? null : 'reply')}
            className="p-1.5 text-slate-500 hover:text-pulse hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MessageSquareReply size={16} />
          </button>
          {comment.canEdit && (
            <button
              title="Edit"
              onClick={() => setMode(mode === 'edit' ? null : 'edit')}
              className="p-1.5 text-slate-500 hover:text-pulse hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Pencil size={16} />
            </button>
          )}
          {comment.canDelete && (
            <button
              title="Hapus"
              onClick={() => onDelete(comment.commentId)}
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          {isAdmin && (
            <button
              title="Sembunyikan"
              onClick={() => onHide(comment.commentId)}
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <ShieldAlert size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-700 ml-11 mb-3">{comment.content}</p>

      {/* Reply Form */}
      {mode === 'reply' && (
        <div className="ml-11 mt-3 mb-4 space-y-2">
          <textarea
            value={draftReply}
            onChange={(e) => setDraftReply(e.target.value)}
            rows={2}
            placeholder="Tulis balasan..."
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              onClick={() => setMode(null)}
            >
              Batal
            </button>
            <button
              className="px-4 py-1.5 text-sm bg-pulse hover:bg-pulse-dark text-white rounded-lg transition-colors font-medium"
              onClick={() => {
                onReply(comment.commentId, draftReply);
                setDraftReply('');
                setMode(null);
              }}
            >
              Kirim Balasan
            </button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {mode === 'edit' && (
        <div className="ml-11 mt-3 mb-4 space-y-2">
          <textarea
            value={draftEdit}
            onChange={(e) => setDraftEdit(e.target.value)}
            rows={2}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              onClick={() => {
                setMode(null);
                setDraftEdit(comment.content);
              }}
            >
              Batal
            </button>
            <button
              className="px-4 py-1.5 text-sm bg-pulse hover:bg-pulse-dark text-white rounded-lg transition-colors font-medium"
              onClick={() => {
                onUpdate(comment.commentId, draftEdit);
                setMode(null);
              }}
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies?.length > 0 && (
        <div className="ml-11 mt-4 space-y-3 relative before:absolute before:-left-5 before:top-4 before:bottom-6 before:w-px before:bg-slate-200">
          {comment.replies.map((reply) => (
            <div
              key={reply.commentId}
              className="relative before:absolute before:-left-5 before:top-4 before:w-4 before:h-px before:bg-slate-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-slate-800">
                  {reply.author?.displayName || 'User'}
                </span>
                {(reply.author?.badge || reply.author?.role) && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 uppercase tracking-widest bg-white">
                    {reply.author.badge || reply.author.role}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 ml-auto">
                  {new Date(reply.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-600">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
