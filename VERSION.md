# GeoForesight — Version History

## v1.4.0 — Website Lockdown Controls (March 14, 2026)
- **Maintenance Mode**: Lock down the public site with a branded maintenance screen
- **Technical Difficulties Mode**: Display a technical difficulties page for unplanned outages
- **Admin Site Controls Panel**: Toggle lockdown modes directly from the admin dashboard
- Admin portal remains fully accessible during any lockdown
- Settings persisted in DynamoDB + local JSON fallback

## v1.3.0 — Cloudflare R2 File Cleanup (March 13, 2026)
- **Automatic R2 Deletion**: Files are now deleted from Cloudflare R2 when posts are declined or deleted
- Created centralized `deleteBucketFiles` utility in `r2-utils.ts`
- Fixed orphaned file bug where declined posts left files in the bucket
- Accepted request purges no longer delete files used by live posts

## v1.2.0 — File Upload & Image Rendering Fixes (March 12, 2026)
- **Large File Upload Support**: Disabled Next.js body parsing, enforced Node.js runtime
- **Public Image Rendering**: Added `NEXT_PUBLIC_R2_URL` support for R2 public URLs
- Configured `next.config.ts` with `*.r2.dev` and `*.r2.cloudflarestorage.com` remote patterns
- Improved frontend error messages for upload failures

## v1.1.0 — Comment System & Bot Moderation (Prior)
- Collaborative comment system with user registration
- Bot auto-moderation with configurable violation/severe terms
- Comment sanctions (muting, banning, strike system)
- Admin bot settings panel

## v1.0.0 — Initial Release (Prior)
- Blog publishing platform for Remote Sensing & GIS research
- Post request → admin review → publish workflow
- DynamoDB + local JSON hybrid storage
- Cloudflare R2 for file/image storage
- Rich text editor for content creation
- SEO optimization with structured data, Open Graph, and sitemaps
- Cloudflare Web Analytics & Vercel Speed Insights
- Sentry error monitoring
- Email notifications via SMTP
- IndexNow integration for search engine pinging
