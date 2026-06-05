import { AlertTriangle, Info, Loader2 } from 'lucide-react';

export function InlineLoader({ label = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-8 text-pulse">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse px-4 pb-16 pt-6 sm:px-6">
      <div className="mb-6 h-6 w-40 rounded-full bg-slate-200" />
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-white/90 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-4 w-44 rounded-full bg-slate-200" />
            <div className="h-11 w-full rounded-2xl bg-slate-200 sm:w-40" />
          </div>
        </div>

        <div className="space-y-6 p-4 sm:p-6 md:p-8">
          <div className="aspect-video w-full rounded-2xl bg-slate-200" />
          <div className="space-y-3">
            <div className="h-3 w-28 rounded-full bg-slate-200" />
            <div className="h-16 w-full rounded-3xl bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="h-12 w-full rounded-xl bg-slate-200" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-16 rounded-full bg-slate-200" />
              <div className="h-12 w-full rounded-xl bg-slate-200" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <div className="h-3 w-28 rounded-full bg-slate-200" />
              <div className="h-24 w-full rounded-xl bg-slate-200" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-20 rounded-full bg-slate-200" />
            <div className="h-80 w-full rounded-[28px] bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({
  title = 'Terjadi kendala',
  message,
  actionLabel,
  onAction
}) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center text-center max-w-md mx-auto my-4 shadow-sm">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle size={24} />
      </div>
      <h3 className="text-lg font-bold text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-600 mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 flex flex-col items-center text-center max-w-md mx-auto my-4 shadow-sm">
      <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-4">
        <Info size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}