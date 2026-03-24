export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  // Use the secret key from env var. Do not hardcode!
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error("🚨 CRITICAL ERROR: TURNSTILE_SECRET_KEY is required in production! Authentication denied.");
      return false; // Fail securely in production
    }
    console.warn("⚠️ WARNING: TURNSTILE_SECRET_KEY is not set in environment variables! Turnstile verification will be bypassed.");
    return true; // Bypass only in development
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}
