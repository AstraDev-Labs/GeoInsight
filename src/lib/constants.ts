const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();

if (!rawSiteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required. Configure your domain in environment variables.");
}

export const SITE_URL = rawSiteUrl.replace(/\/$/, "");
