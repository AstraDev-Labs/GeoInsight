#!/usr/bin/env node

const defaultSiteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';
const baseUrl = (process.argv[2] || defaultSiteUrl).replace(/\/$/, '');
const configuredSiteHost = (() => {
  try {
    return new URL(defaultSiteUrl).host;
  } catch {
    return '';
  }
})();

const fetchText = async (url) => {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`${url} -> HTTP ${res.status}`);
  }
  return res.text();
};

const decodeXml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'");

const getSitemapUrls = async () => {
  const xml = await fetchText(`${baseUrl}/sitemap.xml`);
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decodeXml(m[1]));
  return matches;
};

const extractMeta = (html, name, attr = 'name') => {
  const re = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
  const match = html.match(re);
  return match ? match[1] : null;
};

const extractCanonical = (html) => {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
};

const extractJsonLd = (html) => {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1].trim())
    .filter(Boolean);

  return blocks.map((raw) => {
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch {
      return { ok: false, value: raw };
    }
  });
};

const normalizeUrl = (url) => {
  try {
    return new URL(url, baseUrl).toString().replace(/\/$/, '');
  } catch {
    return url;
  }
};

const main = async () => {
  let failures = 0;

  const sitemapUrls = await getSitemapUrls();

  // If we are testing a non-production baseUrl, map sitemap URLs to the test domain
  const mappedSitemapUrls = sitemapUrls.map(url => {
    try {
      const u = new URL(url);
      if (u.origin !== new URL(baseUrl).origin) {
        return new URL(u.pathname + u.search + u.hash, baseUrl).toString();
      }
    } catch {
      // Not a valid absolute URL, return as is
    }
    return url;
  });

  const probeUrls = [baseUrl, ...mappedSitemapUrls].slice(0, 15);

  console.log(`SEO check target: ${baseUrl}`);
  console.log(`Checking ${probeUrls.length} pages (mapped from sitemap)...`);

  for (const url of probeUrls) {
    try {
      const html = await fetchText(url);
      const canonical = extractCanonical(html);
      const ogUrl = extractMeta(html, 'og:url', 'property');
      const jsonLd = extractJsonLd(html);

      const normalizedPage = normalizeUrl(url);
      const normalizedCanonical = canonical ? normalizeUrl(canonical) : null;
      const normalizedOg = ogUrl ? normalizeUrl(ogUrl) : null;

      if (!canonical) {
        failures += 1;
        console.log(`FAIL canonical missing: ${url}`);
      }

      if (canonical && normalizedCanonical !== normalizedPage) {
        // Special case: if we are on a test domain (localhost/127) but canonical points to production,
        // it's acceptable if the paths match.
        const isTestDomain = url.includes('127.0.0.1') || url.includes('localhost');
        const isProdCanonical = configuredSiteHost ? canonical.includes(configuredSiteHost) : false;

        const pathPage = new URL(url, baseUrl).pathname.replace(/\/$/, '') || '/';
        const pathCanonical = new URL(canonical, baseUrl).pathname.replace(/\/$/, '') || '/';

        if (isTestDomain && isProdCanonical && pathPage === pathCanonical) {
          // This is fine, staging can point to prod canonical
        } else {
          failures += 1;
          const hint = (canonical.includes('localhost') || canonical.includes('127.0.0.1')) && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')
            ? ' (🚨 ACTION REQUIRED: Your production build is hardcoding "localhost" as the site URL. Check NEXT_PUBLIC_SITE_URL in your Vercel Project Settings!)'
            : '';
          console.log(`FAIL canonical mismatch: ${url} -> ${canonical}${hint}`);
        }
      }

      if (ogUrl && canonical && normalizedOg !== normalizedCanonical) {
        // Special case: if we are on a test domain (localhost/127) but ogUrl points to production,
        // it's acceptable if the paths match canonical.
        const isTestDomain = url.includes('127.0.0.1') || url.includes('localhost');
        const isProdOg = configuredSiteHost ? ogUrl.includes(configuredSiteHost) : false;


        const pathCanonical = new URL(canonical, baseUrl).pathname.replace(/\/$/, '') || '/';
        const pathOg = new URL(ogUrl, baseUrl).pathname.replace(/\/$/, '') || '/';

        if (isTestDomain && isProdOg && pathOg === pathCanonical) {
          // This is fine
        } else {
          failures += 1;
          console.log(`FAIL og:url mismatch: ${url} -> og:url=${ogUrl}, canonical=${canonical}`);
        }
      }

      if (jsonLd.length === 0) {
        console.log(`WARN no JSON-LD blocks: ${url}`);
      }

      for (const block of jsonLd) {
        if (!block.ok) {
          failures += 1;
          console.log(`FAIL invalid JSON-LD syntax: ${url}`);
          continue;
        }

        const nodes = Array.isArray(block.value) ? block.value : [block.value];
        for (const node of nodes) {
          if (!node || typeof node !== 'object') {
            failures += 1;
            console.log(`FAIL JSON-LD node is not object: ${url}`);
            continue;
          }
          if (!node['@context'] || !node['@type']) {
            failures += 1;
            console.log(`FAIL JSON-LD missing @context/@type: ${url}`);
          }
        }
      }

      console.log(`OK ${url}`);
    } catch (error) {
      const isTestDomain = url.includes('127.0.0.1') || url.includes('localhost');
      const isPostPage = url.includes('/blog/');
      const msg = error instanceof Error ? error.message : String(error);

      if (isTestDomain && isPostPage && msg.includes('HTTP 404')) {
        console.log(`WARN ${url}: ${msg} (Expected in CI/Local with clean DB)`);
      } else {
        failures += 1;
        console.log(`FAIL ${url}: ${msg}`);
      }
    }
  }

  // Robots + sitemap endpoint checks for monitoring setup.
  try {
    const robots = await fetchText(`${baseUrl}/robots.txt`);
    if (!robots.includes('Sitemap:')) {
      failures += 1;
      console.log('FAIL robots.txt missing Sitemap directive');
    } else {
      console.log('OK robots.txt includes Sitemap directive');
    }
  } catch (error) {
    failures += 1;
    console.log(`FAIL robots.txt check: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (failures > 0) {
    console.log(`\nSEO checks completed with ${failures} failure(s). Target: ${baseUrl}`);
    process.exitCode = 1;
    return;
  }

  console.log('\nSEO checks passed.');
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
