#!/usr/bin/env node

const baseUrl = (process.env.BASE_URL || process.argv[2] || 'https://geo-insight-seven.vercel.app').replace(/\/$/, '');
const durationSec = Number(process.env.DURATION_SEC || process.argv[3] || 20);
const concurrency = Number(process.env.CONCURRENCY || process.argv[4] || 10);

const endpoints = [
  '/api/posts?status=published',
  '/api/requests?status=pending',
];

const stats = new Map();

for (const endpoint of endpoints) {
  stats.set(endpoint, {
    count: 0,
    errors: 0,
    latencies: [],
    cacheHits: 0,
    cacheMisses: 0,
  });
}

const percentile = (arr, p) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
};

const worker = async (deadline) => {
  while (Date.now() < deadline) {
    for (const endpoint of endpoints) {
      const target = `${baseUrl}${endpoint}`;
      const start = Date.now();
      try {
        const res = await fetch(target, { headers: { 'cache-control': 'no-cache' } });
        const latency = Date.now() - start;
        const entry = stats.get(endpoint);

        entry.count += 1;
        entry.latencies.push(latency);

        if (!res.ok) {
          entry.errors += 1;
        }

        const cache = res.headers.get('x-cache-hit');
        if (cache === '1') entry.cacheHits += 1;
        if (cache === '0') entry.cacheMisses += 1;
      } catch {
        const entry = stats.get(endpoint);
        entry.errors += 1;
      }
    }
  }
};

const main = async () => {
  const deadline = Date.now() + durationSec * 1000;
  console.log(`Load test target: ${baseUrl}`);
  console.log(`Duration: ${durationSec}s | Concurrency: ${concurrency}`);

  await Promise.all(Array.from({ length: concurrency }, () => worker(deadline)));

  console.log('\nResults:');
  for (const endpoint of endpoints) {
    const entry = stats.get(endpoint);
    const avg = entry.latencies.length > 0
      ? entry.latencies.reduce((a, b) => a + b, 0) / entry.latencies.length
      : 0;

    console.log(`\n${endpoint}`);
    console.log(`  requests: ${entry.count}`);
    console.log(`  errors: ${entry.errors}`);
    console.log(`  avg: ${avg.toFixed(1)}ms`);
    console.log(`  p50: ${percentile(entry.latencies, 50).toFixed(1)}ms`);
    console.log(`  p95: ${percentile(entry.latencies, 95).toFixed(1)}ms`);
    console.log(`  p99: ${percentile(entry.latencies, 99).toFixed(1)}ms`);
    console.log(`  cache hits/misses: ${entry.cacheHits}/${entry.cacheMisses}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});