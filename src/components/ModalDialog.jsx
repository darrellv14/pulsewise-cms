import { Loader2, X } from 'lucide-react';

export function ModalDialog({
  open,
  title,
  description,
  confirmLabel = 'Lanjutkan',
  cancelLabel = 'Batal',
  confirmTone = 'pulse',
  isPending = false,
  onClose,
  onConfirm,
  children
}) {
  if (!open) {
    return null;
  }

  const confirmClassName =
    confirmTone === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : confirmTone === 'slate'
        ? 'bg-slate-900 hover:bg-slate-700 text-white'
        : 'bg-pulse hover:bg-pulse-dark text-white';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
            {description ? (
              <p className="text-sm leading-6 text-slate-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition-colors hover:border-pulse/30 hover:text-pulse disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {children}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${confirmClassName}`}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
