# 🌐 GeoInsights — Remote Sensing & GIS Intelligence Platform

A premium, full-stack collaborative research blog built with **Next.js 16**, **AWS (DynamoDB + S3)**, and **Framer Motion**. Designed for remote sensing teams to publish, review, and manage geospatial research findings with a sleek dark glassmorphic UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![AWS](https://img.shields.io/badge/AWS-DynamoDB%20%2B%20S3-orange?logo=amazon-aws)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Release Notes (2026-02-23)

- Removed language switching and kept UI text flow on fixed English translation paths.
- Implemented roadmap items:
  - `#8` Analytics dashboard
  - `#9` Performance improvements
  - `#10` SEO/discovery upgrades
  - `#14` Collaboration comments/replies
- Added threaded comments with recursive reply support (reply to any message depth).
- Added DB-backed comment auth with signup, email verification, and login by username/email.
- Added role-aware moderation (`user`/`bot`/`admin`) and AutoMod sanctions (hide/mute/ban).
- Added Admin Bot Settings panel + `/api/admin/bot-settings` to configure moderation behavior.
- Improved Bot Settings persistence reliability (AWS + local DB mirror fallback).
- Added SEO validation tooling (`scripts/seo-check.mjs`) for JSON-LD/canonical/OG/robots checks.
- Added API performance observability:
  - response-time headers
  - cache-hit headers
  - server-timing
  - slow-path profiling logs
- Added list endpoint load testing (`scripts/load-test-list-endpoints.mjs`).

---

## ✨ Features

### 📝 Research Publishing
- **Rich Text Editor (TipTap)** — Full WYSIWYG editor with headings, bold, italic, lists, blockquotes, code blocks, links, and undo/redo
- **Image & Document Uploads** — Drag-and-drop file uploads stored on AWS S3 with automatic preview generation
- **Category System** — Posts organized by research vectors: Land Cover Change, Urban GIS, Hydrology, Agriculture, Climate Analysis
- **Markdown + HTML Support** — Renders both legacy Markdown and new rich text content seamlessly

### 🔒 Admin Dashboard (`/admin`)
- **Secure Authentication** — Password-protected admin panel with session-based tokens
- **Intelligence Review Modal** — Full post preview with metadata (title, author, email, category, abstract, content, images, attachments)
- **Approve & Publish** — One-click publishing with automatic email notification to the author
- **Decline Submissions** — Reject posts with optional reviewer notes, author gets notified
- **Analytics Dashboard** — Real-time stats for total published, pending actions, and system logs
- **Tabbed Interface** — Separate views for requests, posts, and history logs with pagination
- **Clear History** — Bulk remove processed entries

### 👤 Author Features
- **Author Profiles** (`/author/[name]`) — Dynamic public portfolio pages showing all published research by an author
- **Edit Own Posts** — Authors can authenticate with their credentials and request edits (re-submitted for admin review)
- **Delete Own Posts** — Secure deletion with email + password verification
- **Author Controls** — Edit/Delete buttons visible only on the author's own published posts

### 📧 Email Notifications
- **Submission Received** — Confirmation email when a research post is submitted
- **Publication Approved** — Notification with a direct link to the live post
- **Submission Declined** — Notification with optional reviewer feedback
- **Beautiful HTML Templates** — Dark-themed, responsive email templates matching the platform aesthetic
- **SMTP Support** — Works with Gmail, AWS SES, SendGrid, or any SMTP provider
- **Graceful Fallback** — Silently skips emails if SMTP isn't configured (no crashes)

### 🔍 SEO & Indexing
- **Dynamic Sitemap** (`/sitemap.xml`) — Auto-generates entries for all published posts, author profiles, and static pages
- **Robots.txt** (`/robots.txt`) — Allows Google/Bing crawling on public pages, blocks admin and API routes
- **20+ Research Keywords** — Targeted keywords including remote sensing, GIS, satellite imagery, NDVI, LiDAR, etc.
- **Open Graph & Twitter Cards** — Rich social media previews when sharing links
- **JSON-LD Structured Data** — Organization and WebSite schemas for enhanced search results
- **Google & Bing Verification** — Built-in support via environment variables

### 💬 Comment System, Auth & Moderation (New)
- **Threaded Discussion** — Nested comments/replies on blog posts (reply to any message depth)
- **Signed-in Commenting** — Only authenticated `user` accounts can post comments/replies
- **DB-Backed Accounts** — Comment accounts are stored in DB with role (`user`/`bot`/`admin`)
- **Email Verification** — Signup requires unique email + OTP verification before login
- **Login by Username or Email** — Sign-in accepts display name or email + password
- **Role-Aware Moderation** — `bot` and `admin` roles can hide/unhide/delete comments
- **AutoMod Pipeline** — Automated text moderation for violations/severe violations
- **Sanctions Engine** — Auto-hide, temporary mute, and severe-ban logic
- **Stable Identity Enforcement** — Sanctions tied to stable account `userId` (not display name)
- **Comment Auth APIs**:
  - `POST /api/comments/auth/signup`
  - `POST /api/comments/auth/verify-email`
  - `POST /api/comments/auth/login`
  - `POST /api/comments/auth/logout`
  - `GET /api/comments/auth/session`

### 🤖 Bot Controls In Admin (New)
- **AutoMod Bot Settings Panel** in `/admin`
- Configurable controls:
  - Enable/disable auto moderation
  - Mute duration (hours)
  - Auto-ban on severe violations
- Hidden/internal keyword lists remain active but not exposed in UI
- **Admin Bot Settings API**:
  - `GET /api/admin/bot-settings`
  - `PUT /api/admin/bot-settings`
- Settings persist reliably (AWS + local mirror fallback)

### ⚡ Performance & Observability (New)
- **List API Instrumentation**
  - `X-Response-Time-Ms`
  - `X-Cache-Hit`
  - `Server-Timing`
- **Short-TTL In-Memory Caching** on list endpoints:
  - `GET /api/posts`
  - `GET /api/requests`
- **Slow-Path Profiling Logs** in data layer for:
  - `getPosts`
  - `getRequests`
  - `getCommentsForPost`
- **Load Test Script** for list endpoints:
  - `scripts/load-test-list-endpoints.mjs`
  - `npm run perf:load`

### ✅ SEO Follow-up Tooling (New)
- **SEO Validation Script**:
  - `scripts/seo-check.mjs`
  - `npm run seo:check`
- Validates:
  - JSON-LD parseability + required schema fields
  - Canonical presence and URL consistency
  - OpenGraph canonical consistency (`og:url`)
  - `robots.txt` sitemap directive
- **Canonical/OG Consistency Improvement**
  - Author pages now include explicit `openGraph.url`

### 🎨 UI/UX Design
- **Dark Glassmorphic Theme** — Premium aesthetic with backdrop blur, glass cards, and subtle glow effects
- **Framer Motion Animations** — Smooth page transitions, hover effects, and micro-interactions
- **Responsive Design** — Fully responsive across desktop, tablet, and mobile
- **Search & Filter** — Real-time search and category filtering on the home feed
- **Sticky Footers** — Consistent footer positioning across all pages
- **Custom Scrollbar** — Themed scrollbar matching the dark design
- **Outfit Font** — Modern typography via Google Fonts

### 📜 Legal & Support
- **Privacy Policy** (`/privacy`) — Comprehensive data handling policy
- **Support Center** (`/support`) — Contact form, FAQ section, email support, and documentation links

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 + Custom CSS |
| **Animations** | Framer Motion |
| **Rich Text** | TipTap (Headless Editor) |
| **Database** | AWS DynamoDB |
| **File Storage** | AWS S3 |
| **Email** | Nodemailer (SMTP) |
| **Auth** | bcrypt.js (Password Hashing) |
| **Icons** | Lucide React |
| **Content** | React Markdown + remark-gfm |
| **Deployment** | Vercel (Serverless) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page — hero, blog feed, search/filter
│   ├── layout.tsx                  # Root layout with SEO metadata & structured data
│   ├── globals.css                 # Global styles, theme variables, TipTap styles
│   ├── sitemap.ts                  # Dynamic sitemap generation
│   ├── robots.ts                   # Search engine crawler rules
│   ├── admin/page.tsx              # Admin dashboard
│   ├── blog/[id]/page.tsx          # Individual blog post page
│   ├── author/[name]/page.tsx      # Author profile page
│   ├── request-post/page.tsx       # Post submission form
│   ├── privacy/page.tsx            # Privacy policy
│   ├── support/page.tsx            # Support center
│   └── api/
│       ├── posts/route.ts          # GET all posts
│       ├── posts/[id]/route.ts     # PATCH/DELETE individual post
│       ├── requests/route.ts       # GET/POST requests
│       ├── requests/[id]/route.ts  # PATCH/DELETE individual request
│       ├── upload/route.ts         # File upload (S3 or local)
│       └── admin/
│           ├── login/route.ts      # Admin authentication
│           ├── logout/route.ts     # Admin session cleanup
│           ├── verify/route.ts     # Token verification
│           ├── notify/route.ts     # Email notification trigger
│           └── clear-history/route.ts
├── components/
│   ├── Navbar.tsx                  # Navigation bar
│   ├── RichTextEditor.tsx          # TipTap WYSIWYG editor
│   ├── EditPostButton.tsx          # Author edit modal
│   ├── DeletePostButton.tsx        # Author delete modal
│   └── BlogPostModal.tsx           # Post viewer component
├── lib/
│   ├── aws-config.ts              # AWS DynamoDB + S3 client initialization
│   ├── data-service.ts            # Database abstraction layer
│   ├── email-service.ts           # Email templates & sending logic
│   ├── mock-api.ts                # Client-side API wrapper
│   └── types.ts                   # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS Account (for DynamoDB + S3)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_ORG/rs-blog.git
cd rs-blog
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root:

```env
# AWS
USE_AWS=true
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE=RSBlogTable
S3_BUCKET=rs-blog-images

# Admin
ADMIN_PASSWORD=YourSecurePassword

# Email (Optional — emails skipped if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Search Engine Verification (Optional)
GOOGLE_SITE_VERIFICATION=your-google-code
BING_SITE_VERIFICATION=your-bing-code
INDEX_NOW_KEY=your-indexnow-key

# Comment Auth
COMMENT_AUTH_SECRET=your-comment-auth-secret
COMMENT_BOT_PASSWORD=legacy-bot-password-if-still-needed
```

> Note: Comment `admin`/`bot` access is DB-backed by role.  
> `COMMENT_BOT_PASSWORD` is legacy-compatible only; prefer managed role accounts in DB.

### 4. Run Locally
```bash
npm run dev
```
Open [https://your-domain.vercel.app](https://your-domain.vercel.app)

### 5. Deploy to Vercel
```bash
npx vercel
```
Or connect your GitHub repo directly in [vercel.com/dashboard](https://vercel.com/dashboard).

> **Important:** Add all `.env.local` variables to Vercel's Environment Variables in the project settings.

---

## 🔧 AWS Setup

### DynamoDB Table
Create a table named `RSBlogTable` with:
- **Partition Key:** `PK` (String)
- **Sort Key:** `SK` (String)

### S3 Bucket
Create a bucket named `rs-blog-images` with:
- Public read access for uploaded images
- CORS configured for your domain

---

## 🌐 Search Engine Registration

### Google Search Console
1. Visit [search.google.com/search-console](https://search.google.com/search-console)
2. Add your Vercel URL as a property
3. Use HTML Meta Tag verification
4. Add the code to `GOOGLE_SITE_VERIFICATION` in `.env.local`
5. Submit `https://your-domain.vercel.app/sitemap.xml`

### Bing Webmaster Tools
1. Visit [bing.com/webmasters](https://www.bing.com/webmasters)
2. Add your site or import from Google Search Console
3. Add the code to `BING_SITE_VERIFICATION` in `.env.local`
4. Submit your sitemap URL

### IndexNow (Bing/Yandex)
1. Set `INDEX_NOW_KEY` in `.env.local` and in your deployment environment.
2. GeoInsights serves the key dynamically at `/api/indexnow/key` from environment variables.
3. Published/deleted blog URLs are auto-submitted to `https://api.indexnow.org/IndexNow` using `keyLocation=<your-domain>/api/indexnow/key`.

---

## ✅ SEO Validation & Monitoring

### Validate JSON-LD + Canonical/Open Graph Consistency
Run the SEO checker against local or deployed URL:

```bash
# default: NEXT_PUBLIC_SITE_URL (or http://127.0.0.1:3000 if unset)
npm run seo:check

# Deployed
npm run seo:check -- https://your-domain.vercel.app
```

Checks included:
- JSON-LD script parse validity (`application/ld+json`)
- Presence of `@context` and `@type`
- Canonical tag presence and canonical-to-page URL match
- Canonical/OpenGraph URL consistency (`og:url` vs canonical)
- `robots.txt` includes `Sitemap` directive

### Search Console Monitoring
1. Submit `https://your-domain/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
2. Open indexing reports weekly and watch:
   - crawled, not indexed
   - duplicate without user-selected canonical
   - blocked by robots
3. Re-run `npm run seo:check -- https://your-domain` before/after major releases.

---

## ⚡ Performance Follow-up

### API Observability
List endpoints include response-time/cache headers:
- `X-Response-Time-Ms`
- `X-Cache-Hit` (`1`/`0`)
- `Server-Timing`

Slow-path profiling logs warnings for key data-service read paths.

### Load Test List Endpoints
Run a basic load test (requires app running):

```bash
# default: NEXT_PUBLIC_SITE_URL (or http://127.0.0.1:3000), 20s, concurrency 10
npm run perf:load

# custom target / duration / concurrency
npm run perf:load -- https://your-domain.vercel.app 30 20
```

Tested endpoints:
- `/api/posts?status=published`
- `/api/requests?status=pending`

---

## 🧪 CI Quality Gates (New)

GitHub Actions workflow: `.github/workflows/quality-gates.yml`

Blocking checks on PR/push:
1. `npm run build`
2. `npm run seo:check -- http://127.0.0.1:3000`
3. `npm run perf:load -- http://127.0.0.1:3000 10 6`

Additional baseline signal:
- `npm run lint` runs as informational (`continue-on-error`) until existing lint debt is fully resolved.

Local gate runner script:
- `scripts/quality_gate.py`
- Writes markdown report: `quality-gate-report.md`

Run locally:
```bash
# Run default gates (build + seo + load smoke)
npm run quality:gate

# Include lint in local gate execution
npm run quality:gate:lint
```

---

## 📬 Email Configuration

### Gmail (Recommended for Dev)
1. Enable [2-Step Verification](https://myaccount.google.com/security)
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the 16-character app password as `SMTP_PASS`

### AWS SES (Recommended for Production)
1. Verify your domain in AWS SES
2. Use SES SMTP credentials
3. Update `SMTP_HOST` to your SES endpoint

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, blog feed, search & filter |
| `/blog/[id]` | Individual research post with author controls |
| `/author/[name]` | Author portfolio with all published posts |
| `/request-post` | Research submission form with rich text editor |
| `/admin` | Admin dashboard — review, publish, decline |
| `/privacy` | Privacy policy |
| `/support` | Support center with FAQ & contact form |
| `/sitemap.xml` | Auto-generated sitemap |
| `/robots.txt` | Crawler rules |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details. Feel free to use, modify, and distribute as long as the original license is included.

---

<p align="center">
  Built with ❤️ by the GeoInsights Team<br/>
  <strong>Next.js • AWS • Framer Motion • TipTap</strong>
</p>
 
