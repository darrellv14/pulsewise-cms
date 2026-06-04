export const educationKeys = {
  root: ['education'],
  articleDetail: (slug) => ['education', 'article-detail', slug],
  articleComments: (articleId) => ['education', 'article-comments', articleId],
  myArticles: ({ status, page = 1, limit = 10 }) => [
    'education',
    'my-articles',
    { status, page, limit }
  ],
  moderationArticles: ({ page = 1, limit = 20 } = {}) => [
    'education',
    'moderation-articles',
    { page, limit }
  ],
  moderationRevisions: ({ page = 1, limit = 20 } = {}) => [
    'education',
    'moderation-revisions',
    { page, limit }
  ]
};
