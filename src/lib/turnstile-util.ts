export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  // Use the secret key from env var. Do not hardcode!
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.warn("⚠️ WARNING: TURNSTILE_SECRET_KEY is not set in environment variables! Turnstile verification will be bypassed.");
    return true; // Bypass if not set, to not break forms during development
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
