# Cloudflare Security Insights Guide

This guide will help you resolve the remaining issues flagged by the Cloudflare Security Center that require changes within the Cloudflare Dashboard, rather than the codebase.

## 1. DMARC Record Error detected
DMARC helps protect your domain from email spoofing. You need to add a DNS record to your Cloudflare account.

**How to fix:**
1. Log in to your Cloudflare Dashboard and select your domain (`geoforesight.org`).
2. Go to **DNS** -> **Records** in the left sidebar.
3. Click **Add record**.
4. Set the following values:
   - **Type**: `TXT`
   - **Name**: `_dmarc`
   - **Content**: `v=DMARC1; p=none; rua=mailto:contact@geoforesight.org;`
5. Click **Save**.

*Note: `p=none` is a safe testing mode. Once you are comfortable that your legitimate emails are not being blocked, you can later change this to `p=quarantine` or `p=reject` for stricter security.*

## 2. Users without MFA (Multi-Factor Authentication)
Cloudflare requires all accounts with administrative access to have MFA enabled for Enterprise-grade security.

**How to fix:**
1. Log in to your Cloudflare Dashboard.
2. Click on the user profile icon in the top right corner and select **My Profile**.
3. Go to **Authentication** in the left sidebar.
4. Under the **Two-Factor Authentication** section, set up MFA using an Authenticator App (like Google Authenticator or Authy) or a Security Key.

## 3. Review unwanted AI crawlers with AI Labyrinth
Cloudflare has built-in tools to block AI bots from scraping your site's content for training data.

**How to fix:**
1. Go to your Cloudflare Dashboard and select your domain (`geoforesight.org`).
2. Navigate to **Security** -> **Bots** in the left sidebar.
3. Look for the setting related to **AI Scrapers and Crawlers** (or "AI Labyrinth").
4. Toggle this setting to **Block**. This will prevent known AI bots (like OpenAI's GPTBot, Anthropic's crawler, etc.) from accessing your site.

## 4. New SaaS security issue(s) detected
This is usually related to Cloudflare's CASB (Cloud Access Security Broker) integrations if you have connected third-party SaaS apps (like Google Workspace, GitHub, etc.) to Cloudflare.

**How to fix:**
1. In the Cloudflare Dashboard, go to the **Security Center** (where you took the screenshot).
2. Click on **Details** next to the "New SaaS security issue(s) detected" warning.
3. Follow the specific instructions provided on that page, as they are unique to whichever third-party application is connected to your account.
