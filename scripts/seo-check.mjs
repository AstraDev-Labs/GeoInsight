#!/usr/bin/env node

const baseUrl = (process.argv[2] || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

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
  const probeUrls = [baseUrl, ...sitemapUrls].slice(0, 12);

  console.log(`SEO check target: ${baseUrl}`);
  console.log(`Checking ${probeUrls.length} pages from sitemap/canonical sources...`);

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
        failures += 1;
        console.log(`FAIL canonical mismatch: ${url} -> ${canonical}`);
      }

      if (ogUrl && canonical && normalizedOg !== normalizedCanonical) {
        failures += 1;
        console.log(`FAIL og:url mismatch: ${url} -> og:url=${ogUrl}, canonical=${canonical}`);
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
      failures += 1;
      console.log(`FAIL ${url}: ${error instanceof Error ? error.message : String(error)}`);
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
    console.log(`\nSEO checks completed with ${failures} failure(s).`);
    process.exitCode = 1;
    return;
  }

  console.log('\nSEO checks passed.');
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});