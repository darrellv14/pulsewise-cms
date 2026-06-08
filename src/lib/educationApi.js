import { apiClient, uploadViaCloudinary } from './api.js';

export async function fetchCategories() {
  const response = await apiClient.get('/education/categories');
  return response.data.data;
}

export async function fetchTags() {
  const response = await apiClient.get('/education/tags');
  return response.data.data;
}

export async function fetchPublishedArticles(params = {}) {
  const response = await apiClient.get('/education/articles', { params });
  return response.data.data;
}

export async function fetchArticleBySlug(slug) {
  const response = await apiClient.get(`/education/articles/${slug}`);
  return response.data.data;
}

export async function fetchComments(articleId, params = {}) {
  const response = await apiClient.get(
    `/education/articles/${articleId}/comments`,
    { params }
  );
  return response.data.data;
}

export async function fetchMyArticles(params = {}) {
  const response = await apiClient.get('/education/me/articles', { params });
  return response.data.data;
}

export async function fetchMyArticleDetail(articleId) {
  const response = await apiClient.get(`/education/me/articles/${articleId}`);
  return response.data.data;
}

export async function createArticle(payload) {
  const response = await apiClient.post('/education/articles', payload);
  return response.data.data;
}

export async function updateArticle(articleId, payload) {
  const response = await apiClient.put(
    `/education/articles/${articleId}`,
    payload
  );
  return response.data.data;
}

export async function submitArticleForReview(articleId) {
  const response = await apiClient.post(
    `/education/articles/${articleId}/submit-review`,
    {}
  );
  return response.data.data;
}

export async function toggleLike(articleId, liked) {
  if (liked) {
    const response = await apiClient.delete(
      `/education/articles/${articleId}/likes`
    );
    return response.data.data;
  }

  const response = await apiClient.post(
    `/education/articles/${articleId}/likes`,
    {}
  );
  return response.data.data;
}

export async function postComment(articleId, content) {
  const response = await apiClient.post(
    `/education/articles/${articleId}/comments`,
    { content }
  );
  return response.data.data;
}

export async function postReply(commentId, content) {
  const response = await apiClient.post(
    `/education/comments/${commentId}/replies`,
    { content }
  );
  return response.data.data;
}

export async function updateComment(commentId, content) {
  const response = await apiClient.put(`/education/comments/${commentId}`, {
    content
  });
  return response.data.data;
}

export async function deleteComment(commentId) {
  const response = await apiClient.delete(`/education/comments/${commentId}`);
  return response.data.data;
}

export async function fetchPendingArticles(params = {}) {
  const response = await apiClient.get('/admin/education/articles/pending', {
    params
  });
  return response.data.data;
}

export async function fetchAdminArticles(params = {}) {
  const response = await apiClient.get('/admin/education/articles', {
    params
  });
  return response.data.data;
}

export async function fetchPendingRevisions(params = {}) {
  const response = await apiClient.get(
    '/admin/education/articles/revisions/pending',
    { params }
  );
  return response.data.data;
}

export async function fetchAdminArticleDetail(articleId) {
  const response = await apiClient.get(
    `/admin/education/articles/${articleId}`
  );
  return response.data.data;
}

export async function approveArticle(articleId) {
  const response = await apiClient.post(
    `/admin/education/articles/${articleId}/approve`,
    {}
  );
  return response.data.data;
}

export async function rejectArticle(articleId, rejectionReason) {
  const response = await apiClient.post(
    `/admin/education/articles/${articleId}/reject`,
    {
      rejectionReason
    }
  );
  return response.data.data;
}

export async function approveRevision(revisionId) {
  const response = await apiClient.post(
    `/admin/education/revisions/${revisionId}/approve`,
    {}
  );
  return response.data.data;
}

export async function rejectRevision(revisionId, rejectionReason) {
  const response = await apiClient.post(
    `/admin/education/revisions/${revisionId}/reject`,
    {
      rejectionReason
    }
  );
  return response.data.data;
}

export async function featureArticle(
  articleId,
  featured,
  featuredOrder = null
) {
  const response = await apiClient.post(
    `/admin/education/articles/${articleId}/feature`,
    {
      featured,
      featuredOrder
    }
  );
  return response.data.data;
}

export async function deleteArticle(articleId) {
  const response = await apiClient.delete(`/admin/education/articles/${articleId}`);
  return response.data.data;
}

export async function hideComment(commentId) {
  const response = await apiClient.post(
    `/admin/education/comments/${commentId}/hide`,
    {}
  );
  return response.data.data;
}

export async function requestUploadSignature(kind = 'cover') {
  const response = await apiClient.get('/education/upload-signature', {
    params: { kind }
  });
  return response.data.data;
}

export async function uploadEducationImage(file, kind = 'cover', options = {}) {
  const signaturePayload = await requestUploadSignature(kind);
  const upload = await uploadViaCloudinary({
    file,
    signaturePayload,
    onProgress: options.onProgress
  });
  return {
    url: upload.secure_url,
    publicId: upload.public_id
  };
}
