import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  listsPlugin,
  ListsToggle,
  linkPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo
} from '@mdxeditor/editor';
import { useEffect, useMemo, useRef, useState } from 'react';
import { uploadEducationImage } from '../lib/educationApi.js';
import {
  Image as ImageIcon,
  Loader2,
  Send,
  UploadCloud,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import '@mdxeditor/editor/style.css';

function buildInitialForm(initialValue) {
  return {
    title: initialValue?.title || '',
    excerpt: initialValue?.excerpt || '',
    categorySlug:
      initialValue?.category?.slug || initialValue?.categorySlug || '',
    contentMarkdown: initialValue?.contentMarkdown || '',
    tags:
      initialValue?.tags?.map((tag) => tag.slug) ||
      initialValue?.tagSlugs ||
      [],
    coverImageUrl: initialValue?.coverImageUrl || '',
    coverImagePublicId: initialValue?.coverImagePublicId || ''
  };
}

function buildPayload(form, contentMarkdown) {
  return {
    title: form.title,
    excerpt: form.excerpt,
    categorySlug: form.categorySlug,
    contentMarkdown,
    tags: form.tags,
    coverImageUrl: form.coverImageUrl,
    coverImagePublicId: form.coverImagePublicId
  };
}

function serializePayload(payload) {
  return JSON.stringify({
    ...payload,
    tags: [...(payload.tags || [])]
  });
}

function hasMeaningfulDraft(payload) {
  return Boolean(
    payload.title.trim() ||
    payload.excerpt.trim() ||
    payload.categorySlug ||
    payload.contentMarkdown.trim() ||
    payload.tags.length ||
    payload.coverImageUrl
  );
}

function isAutosaveEligible(payload) {
  return Boolean(
    payload.title.trim().length >= 3 &&
    payload.categorySlug &&
    payload.contentMarkdown.trim().length >= 20
  );
}

function validateArticleForm(
  form,
  contentMarkdown,
  { requireReviewReady = false } = {}
) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = 'Judul artikel masih kosong.';
  } else if (form.title.trim().length < 3) {
    errors.title = 'Judul minimal 3 karakter.';
  }

  if (requireReviewReady && !form.categorySlug) {
    errors.categorySlug = 'Pilih kategori sebelum artikel diajukan.';
  }

  if (requireReviewReady && !form.excerpt.trim()) {
    errors.excerpt = 'Ringkasan artikel masih kosong.';
  }

  if (!contentMarkdown.trim()) {
    errors.contentMarkdown = 'Isi artikel masih kosong.';
  }

  return errors;
}

function getAutosaveMessage(status, lastSavedAt) {
  if (status === 'saving') {
    return 'Menyimpan draft otomatis...';
  }

  if (status === 'error') {
    return 'Autosave gagal. Perubahan akan dicoba lagi.';
  }

  if (status === 'saved' && lastSavedAt) {
    return `Draft tersimpan otomatis ${lastSavedAt.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  }

  return 'Saving';
}

function UploadProgress({ label, progress, tone = 'pulse' }) {
  const toneClasses =
    tone === 'emerald'
      ? 'bg-emerald-500'
      : tone === 'amber'
        ? 'bg-amber-500'
        : 'bg-pulse';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs font-semibold text-slate-400">
          {progress}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-200 ${toneClasses}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ArticleForm({
  categories,
  tagOptions,
  initialValue,
  onAutosave,
  onSubmitReview,
  submitLabel = 'Ajukan Review',
  submitPendingLabel = 'Mengirim...',
  submitPending = false
}) {
  const [form, setForm] = useState(() => buildInitialForm(initialValue));
  const latestMarkdownRef = useRef(initialValue?.contentMarkdown || '');
  const editorMarkdown = initialValue?.contentMarkdown || '';
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [inlineUpload, setInlineUpload] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [contentVersion, setContentVersion] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const skipAutosaveRef = useRef(true);
  const lastSyncedRef = useRef(
    serializePayload(
      buildPayload(
        buildInitialForm(initialValue),
        initialValue?.contentMarkdown || ''
      )
    )
  );

  useEffect(() => {
    const nextForm = buildInitialForm(initialValue);
    setForm(nextForm);
    latestMarkdownRef.current = nextForm.contentMarkdown;
    setTagInput('');
    setErrors({});
    setAutosaveStatus('idle');
    skipAutosaveRef.current = true;
    lastSyncedRef.current = serializePayload(
      buildPayload(nextForm, nextForm.contentMarkdown)
    );
  }, [initialValue]);

  useEffect(() => {
    if (!onAutosave) {
      return;
    }

    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }

    const payload = buildPayload(form, latestMarkdownRef.current);
    const serialized = serializePayload(payload);

    if (!hasMeaningfulDraft(payload) || serialized === lastSyncedRef.current) {
      return;
    }

    if (!isAutosaveEligible(payload)) {
      setAutosaveStatus('idle');
      return;
    }

    const timeout = setTimeout(async () => {
      setAutosaveStatus('saving');
      try {
        await onAutosave(payload);
        lastSyncedRef.current = serialized;
        setAutosaveStatus('saved');
        setLastSavedAt(new Date());
      } catch {
        setAutosaveStatus('error');
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [contentVersion, form, onAutosave]);

  const mdxPlugins = useMemo(
    () => [
      headingsPlugin(),
      listsPlugin(),
      quotePlugin(),
      thematicBreakPlugin(),
      markdownShortcutPlugin(),
      linkPlugin(),
      imagePlugin({
        imageUploadHandler: async (file) => {
          setInlineUpload({ fileName: file.name, progress: 0 });
          try {
            const upload = await uploadEducationImage(file, 'inline', {
              onProgress: (progress) =>
                setInlineUpload({ fileName: file.name, progress })
            });
            setInlineUpload({ fileName: file.name, progress: 100 });
            setTimeout(() => setInlineUpload(null), 700);
            return upload.url;
          } catch (error) {
            setInlineUpload(null);
            toast.error(
              error?.message || 'Gambar di isi artikel gagal diunggah.'
            );
            throw error;
          }
        }
      }),
      toolbarPlugin({
        toolbarContents: () => (
          <div className="flex flex-wrap items-center gap-1 p-1">
            <UndoRedo />
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
            <BoldItalicUnderlineToggles />
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
            <BlockTypeSelect />
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
            <ListsToggle />
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
            <CreateLink />
            <InsertImage />
            <div className="hidden sm:flex flex-1" />
            <DiffSourceToggleWrapper />
          </div>
        )
      })
    ],
    []
  );

  async function handleCoverUpload(file) {
    setCoverUploading(true);
    setCoverUploadProgress(0);
    try {
      const upload = await uploadEducationImage(file, 'cover', {
        onProgress: (progress) => setCoverUploadProgress(progress)
      });
      setForm((current) => ({
        ...current,
        coverImageUrl: upload.url,
        coverImagePublicId: upload.publicId
      }));
      setContentVersion((current) => current + 1);
      setCoverUploadProgress(100);
      setTimeout(() => setCoverUploadProgress(0), 700);
    } finally {
      setCoverUploading(false);
    }
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setContentVersion((current) => current + 1);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const runValidation = (options) => {
    const nextErrors = validateArticleForm(
      form,
      latestMarkdownRef.current,
      options
    );
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmitReview = async () => {
    const nextErrors = runValidation({ requireReviewReady: true });
    if (Object.keys(nextErrors).length) {
      return;
    }

    await onSubmitReview?.({
      ...form,
      contentMarkdown: latestMarkdownRef.current
    });
  };

  const normalizeTagValue = (rawValue) =>
    String(rawValue || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/^#+/, '')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/[_\s]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const addTag = (rawValue) => {
    const normalized = normalizeTagValue(rawValue);

    if (!normalized) {
      return;
    }

    setForm((current) => {
      const hasDuplicate = current.tags.some(
        (tag) => normalizeTagValue(tag) === normalized
      );
      if (hasDuplicate) {
        return current;
      }

      return {
        ...current,
        tags: [...current.tags, normalized]
      };
    });
    setContentVersion((current) => current + 1);
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove)
    }));
    setContentVersion((current) => current + 1);
  };

  const handleTagKeyDown = (event) => {
    if (event.key === ',' || event.key === 'Enter') {
      event.preventDefault();
      addTag(tagInput);
      return;
    }

    if (event.key === 'Backspace' && !tagInput.trim() && form.tags.length) {
      event.preventDefault();
      removeTag(form.tags[form.tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-col relative">
      <div className="sticky top-0 sm:top-16 z-20 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="flex items-start gap-3 sm:items-center min-w-0">
            <div
              className={`mt-1 sm:mt-0 w-2.5 h-2.5 shrink-0 rounded-full ${autosaveStatus === 'error' ? 'bg-red-400' : autosaveStatus === 'saving' ? 'bg-amber-400' : 'bg-emerald-400'}`}
              title="Autosave"
            ></div>
            <span className="text-xs sm:text-sm font-medium text-slate-500 leading-5 sm:leading-normal break-words">
              {getAutosaveMessage(autosaveStatus, lastSavedAt)}
            </span>
          </div>
          <div className="w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={
                submitPending || coverUploading || autosaveStatus === 'saving'
              }
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-2 rounded-xl text-white bg-pulse hover:bg-pulse-dark font-medium text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="rotate-45 -mt-1" />
              )}
              {submitPending ? submitPendingLabel : submitLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-6 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-10">
        {Object.keys(errors).length ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5 text-sm text-amber-800">
            <p className="font-semibold">
              Masih ada bagian yang perlu dilengkapi:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {Object.values(errors).map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            Cover Artikel (16:9)
          </label>
          <div className="relative group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />
            <div
              className={`w-full aspect-video rounded-2xl overflow-hidden border-2 flex flex-col items-center justify-center transition-all bg-slate-50 ${form.coverImageUrl ? 'border-transparent' : 'border-dashed border-slate-300 group-hover:border-pulse bg-slate-50 group-hover:bg-pulse/5'}`}
            >
              {coverUploading ? (
                <div className="flex flex-col items-center text-slate-400 px-4 text-center">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <span className="text-sm font-medium">Mengunggah...</span>
                </div>
              ) : form.coverImageUrl ? (
                <>
                  <img
                    src={form.coverImageUrl}
                    alt="Cover Preview"
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-4">
                    <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-slate-700 flex items-center gap-2 text-center">
                      <UploadCloud size={18} /> Ganti Gambar
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-pulse transition-colors px-4 text-center">
                  <ImageIcon size={44} className="mb-3 opacity-50" />
                  <p className="font-medium text-sm">
                    Klik atau drag gambar ke sini
                  </p>
                  <p className="text-xs mt-1">
                    Rekomendasi ukuran: 1200 x 675 px
                  </p>
                </div>
              )}
            </div>
          </div>
          {(coverUploading || coverUploadProgress > 0) && (
            <UploadProgress
              label="Mengunggah cover photo..."
              progress={coverUploadProgress}
              tone="pulse"
            />
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
            Judul artikel *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Judul Artikel..."
            className={`w-full rounded-2xl sm:rounded-3xl border bg-white px-4 py-4 sm:px-5 sm:py-5 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none ${errors.title ? 'border-red-300 ring-4 ring-red-100' : 'border-slate-200 focus:border-pulse focus:ring-4 focus:ring-pulse/10'}`}
          />
          {errors.title ? (
            <p className="mt-2 text-sm font-medium text-red-600">
              {errors.title}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 md:grid-cols-2">
          <div className="space-y-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kategori *
            </label>
            <select
              value={form.categorySlug}
              onChange={(event) =>
                updateField('categorySlug', event.target.value)
              }
              className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none ${errors.categorySlug ? 'border border-red-300 bg-red-50 text-red-700 ring-4 ring-red-100' : 'border border-slate-200 bg-white text-slate-700 focus:border-pulse focus:ring-2 focus:ring-pulse/20'}`}
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categorySlug ? (
              <p className="text-sm font-medium text-red-600">
                {errors.categorySlug}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tags
            </label>
            <div className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-pulse/20 focus-within:border-pulse">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pulse/10 text-pulse px-3 py-1 text-xs font-semibold max-w-full"
                >
                  <span className="truncate max-w-28 sm:max-w-36">#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex items-center justify-center rounded-full hover:bg-pulse/15 transition-colors shrink-0"
                    aria-label={`Hapus tag ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
                placeholder={
                  form.tags.length
                    ? 'Tambah tag lain...'
                    : 'Ketik tag, lalu tekan koma atau Enter'
                }
                className="flex-1 min-w-0 sm:min-w-45 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {tagOptions?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {tagOptions.slice(0, 5).map((tag) => (
                  <button
                    key={tag.tagId}
                    type="button"
                    onClick={() => addTag(tag.slug)}
                    className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-pulse/30 hover:text-pulse transition-colors"
                  >
                    #{tag.name || tag.slug}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ringkasan (Tampil di Feed) *
            </label>
            <textarea
              rows={3}
              maxLength={150}
              value={form.excerpt}
              onChange={(event) => updateField('excerpt', event.target.value)}
              placeholder="Ringkasan singkat maksimal 150 karakter..."
              className={`w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none ${errors.excerpt ? 'border border-red-300 bg-red-50 text-red-700 ring-4 ring-red-100' : 'border border-slate-200 bg-white text-slate-700 focus:border-pulse focus:ring-2 focus:ring-pulse/20'}`}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              {errors.excerpt ? (
                <p className="text-sm font-medium text-red-600">
                  {errors.excerpt}
                </p>
              ) : (
                <span className="text-xs text-slate-400 leading-5">
                  Ringkasan membantu admin dan pembaca memahami isi artikel
                  lebih cepat.
                </span>
              )}
              <span className="text-xs font-medium text-slate-400 shrink-0">
                {form.excerpt.length}/150
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 sm:pt-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Isi Artikel *
              </p>
              <p className="mt-1 text-sm text-slate-500 leading-5">
                Minimal isi konten utama artikel sebelum disimpan atau diajukan.
              </p>
            </div>
          </div>
          {inlineUpload ? (
            <div className="mb-3">
              <UploadProgress
                label={`Mengunggah gambar konten: ${inlineUpload.fileName}`}
                progress={inlineUpload.progress}
                tone="emerald"
              />
            </div>
          ) : null}
          <div
            className={`rounded-2xl sm:rounded-[28px] border bg-white p-2 sm:p-3 overflow-hidden ${errors.contentMarkdown ? 'border-red-300 ring-4 ring-red-100' : 'border-slate-200'}`}
          >
            <MDXEditor
              key={initialValue?.articleId || 'new-article'}
              markdown={editorMarkdown}
              onChange={(markdown) => {
                latestMarkdownRef.current = markdown;
                setContentVersion((current) => current + 1);
                setErrors((current) => {
                  if (!current.contentMarkdown) return current;
                  const next = { ...current };
                  delete next.contentMarkdown;
                  return next;
                });
              }}
              plugins={mdxPlugins}
              contentEditableClassName="min-h-[320px] sm:min-h-[400px] outline-none px-1 sm:px-2"
              className="mdx-editor-custom"
            />
          </div>
          {errors.contentMarkdown ? (
            <p className="mt-2 text-sm font-medium text-red-600">
              {errors.contentMarkdown}
            </p>
          ) : null}
          {initialValue?.status === 'published' ? (
            <p className="mt-3 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700 leading-6">
              Perubahan artikel published akan dikirim sebagai revisi dan
              menunggu review admin sebelum live.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
