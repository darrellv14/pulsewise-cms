import { AlertTriangle, Info, Loader2 } from 'lucide-react';

export function InlineLoader({ label = 'Memuat...' }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-8 text-pulse">
      <Loader2 className="animate-spin" size={32} />
      <span className="text-sm font-medium text-slate-500">{label}</span>
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
