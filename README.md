# PulseWise CMS Web

Web-based CMS frontend for PulseWise Education, built with React, Vite, and MDXEditor.

## What it includes

- Login-only flow using existing PulseWise account credentials
- Published article feed
- Article detail with likes and comments
- My Articles dashboard
- MDXEditor-based writer workspace
- Admin moderation queue for pending articles and revisions

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Environment

Copy `.env.example` to `.env` if you want to override the API URL:

```bash
VITE_API_BASE_URL=https://api.darrellvalentino.com
```

## Notes

- Content is sent as raw `contentMarkdown`, so it stays compatible with the backend snapshot/revision design.
- Cover and inline image uploads use the backend-signed Cloudinary flow:
  - `GET /education/upload-signature?kind=cover`
  - `GET /education/upload-signature?kind=inline`
- If a published article title changes and the revision is approved, the live slug can change too. Refetch the article detail after approval.
