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
  UploadCloud,
  Image as ImageIcon,
  Send,
  Save,
  Loader2,
  X
} from 'lucide-react';
import '@mdxeditor/editor/style.css';

export function ArticleForm({
  categories,
  tagOptions,
  initialValue,
  onSave,
  onSubmitReview,
  submitLabel = 'Simpan Draft'
}) {
  const [form, setForm] = useState(() => ({
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
  }));
  const latestMarkdownRef = useRef(initialValue?.contentMarkdown || '');
  const editorMarkdown = initialValue?.contentMarkdown || '';
  const [coverUploading, setCoverUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialValue) {
      const nextMarkdown = initialValue.contentMarkdown || '';
      setForm({
        title: initialValue.title || '',
        excerpt: initialValue.excerpt || '',
        categorySlug:
          initialValue.category?.slug || initialValue.categorySlug || '',
        contentMarkdown: nextMarkdown,
        tags:
          initialValue.tags?.map((tag) => tag.slug) ||
          initialValue.tagSlugs ||
          [],
        coverImageUrl: initialValue.coverImageUrl || '',
        coverImagePublicId: initialValue.coverImagePublicId || ''
      });
      latestMarkdownRef.current = nextMarkdown;
      setTagInput('');
    }
  }, [initialValue]);

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
          const upload = await uploadEducationImage(file, 'inline');
          return upload.url;
        }
      }),
      toolbarPlugin({
        toolbarContents: () => (
          <div className="flex flex-wrap items-center gap-1 p-1">
            <UndoRedo />
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <BoldItalicUnderlineToggles />
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <BlockTypeSelect />
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <ListsToggle />
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <CreateLink />
            <InsertImage />
            <div className="flex-1" />
            <DiffSourceToggleWrapper />
          </div>
        )
      })
    ],
    []
  );

  async function handleCoverUpload(file) {
    setCoverUploading(true);
    try {
      const upload = await uploadEducationImage(file, 'cover');
      setForm((current) => ({
        ...current,
        coverImageUrl: upload.url,
        coverImagePublicId: upload.publicId
      }));
    } finally {
      setCoverUploading(false);
    }
  }

  const handleSaveWrapper = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ ...form, contentMarkdown: latestMarkdownRef.current });
    } finally {
      setIsSaving(false);
    }
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
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove)
    }));
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
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-white sticky top-16 z-20">
        <div className="flex items-center gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full bg-slate-300"
            title="Draft"
          ></div>
          <span className="text-sm font-medium text-slate-500">
            {initialValue?.status === 'published'
              ? 'Published'
              : initialValue?.status === 'pending_review'
                ? 'Menunggu Review'
                : 'Draft Tersimpan'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveWrapper}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium text-sm transition-colors"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={() =>
              onSubmitReview?.({
                ...form,
                contentMarkdown: latestMarkdownRef.current
              })
            }
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white bg-pulse hover:bg-pulse-dark font-medium text-sm transition-colors shadow-sm"
          >
            <Send size={16} className="rotate-45 -mt-1" />
            Ajukan Review
          </button>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8">
        {/* Cover Image */}
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
                <div className="flex flex-col items-center text-slate-400">
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
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <UploadCloud size={18} /> Ganti Gambar
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-pulse transition-colors">
                  <ImageIcon size={48} className="mb-3 opacity-50" />
                  <p className="font-medium text-sm">
                    Klik atau Drag gambar ke sini
                  </p>
                  <p className="text-xs mt-1">
                    Rekomendasi ukuran: 1200 x 675 px
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
            placeholder="Judul Artikel..."
            className="w-full text-4xl md:text-5xl font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent"
          />
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kategori
            </label>
            <select
              value={form.categorySlug}
              onChange={(e) =>
                setForm((c) => ({ ...c, categorySlug: e.target.value }))
              }
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tags
            </label>
            <div className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-pulse/20 focus-within:border-pulse">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pulse/10 text-pulse px-3 py-1 text-xs font-semibold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="inline-flex items-center justify-center rounded-full hover:bg-pulse/15 transition-colors"
                    aria-label={`Hapus tag ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
                placeholder={
                  form.tags.length
                    ? 'Tambah tag lain...'
                    : 'Ketik tag, lalu tekan koma atau Enter'
                }
                className="flex-1 min-w-45 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            {tagOptions?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {tagOptions.slice(0, 8).map((tag) => (
                  <button
                    key={tag.tagId}
                    type="button"
                    onClick={() => addTag(tag.slug)}
                    className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 hover:border-pulse/30 hover:text-pulse transition-colors"
                  >
                    #{tag.slug}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ringkasan (Tampil di Feed)
            </label>
            <textarea
              rows={2}
              maxLength={150}
              value={form.excerpt}
              onChange={(e) =>
                setForm((c) => ({ ...c, excerpt: e.target.value }))
              }
              placeholder="Ringkasan singkat maksimal 150 karakter..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pulse/20 focus:border-pulse resize-none"
            />
          </div>
        </div>

        {/* Editor Body */}
        <div className="prose prose-pulse prose-slate max-w-none md:prose-lg mt-8 border-t border-slate-100 pt-8">
          <MDXEditor
            key={initialValue?.articleId || 'new-article'}
            markdown={editorMarkdown}
            onChange={(markdown) => {
              latestMarkdownRef.current = markdown;
            }}
            plugins={mdxPlugins}
            contentEditableClassName="min-h-[400px] outline-none"
            className="mdx-editor-custom"
          />
        </div>
      </div>
    </div>
  );
}
