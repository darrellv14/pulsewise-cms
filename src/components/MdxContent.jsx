import { evaluate } from '@mdx-js/mdx';
import { useEffect, useState } from 'react';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';

export function MdxContent({ source }) {
  const [Content, setContent] = useState(() => null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function compile() {
      setLoading(true);
      setError('');

      try {
        const evaluated = await evaluate(source || '', {
          ...runtime,
          remarkPlugins: [remarkGfm]
        });

        if (active) {
          setContent(() => evaluated.default);
        }
      } catch (compileError) {
        if (active) {
          setError(
            compileError instanceof Error
              ? compileError.message
              : 'MDX gagal dirender.'
          );
          setContent(() => null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    compile();

    return () => {
      active = false;
    };
  }, [source]);

  if (loading) {
    return <div className="mdx-render-loading">Merender konten artikel...</div>;
  }

  if (error) {
    return (
      <div className="error-banner">
        Konten tidak bisa dirender sebagai MDX penuh. Detail: {error}
      </div>
    );
  }

  if (!Content) {
    return <div className="empty-state">Belum ada konten artikel.</div>;
  }

  return (
    <article className="prose prose-pulse prose-lg max-w-none prose-slate mx-auto">
      <Content />
    </article>
  );
}
