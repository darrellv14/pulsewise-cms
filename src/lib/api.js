import axios from 'axios';
import { API_BASE_URL } from '../config.js';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export async function uploadViaCloudinary({
  file,
  signaturePayload,
  onProgress
}) {
  const formData = new FormData();
  formData.set('file', file);
  formData.set('api_key', signaturePayload.apiKey);
  formData.set('timestamp', signaturePayload.timestamp);
  formData.set('signature', signaturePayload.signature);
  formData.set('folder', signaturePayload.folder);
  if (signaturePayload.allowedFormats?.length) {
    formData.set('allowed_formats', signaturePayload.allowedFormats.join(','));
  }
  if (signaturePayload.transformation) {
    formData.set('transformation', signaturePayload.transformation);
  }

  if (signaturePayload.publicId) {
    formData.set('public_id', signaturePayload.publicId);
  }

  const cloudName = signaturePayload.cloudName;

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        onUploadProgress: (event) => {
          if (!onProgress || !event.total) {
            return;
          }

          const percent = Math.max(
            0,
            Math.min(100, Math.round((event.loaded / event.total) * 100))
          );
          onProgress(percent);
        }
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error?.response?.data?.error?.message || 'Cloudinary upload failed';
    throw new Error(message);
  }
}