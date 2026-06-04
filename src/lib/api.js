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

export async function uploadViaCloudinary({ file, signaturePayload }) {
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
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    let message = 'Cloudinary upload failed';
    try {
      const payload = await response.json();
      message = payload?.error?.message || message;
    } catch {
      // ignore parse failures
    }
    throw new Error(message);
  }

  return response.json();
}
