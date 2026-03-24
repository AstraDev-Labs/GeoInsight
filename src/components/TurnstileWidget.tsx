'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  action?: string;
}

export default function TurnstileWidget({ onVerify, action = 'login' }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load the Turnstile script if it hasn't been loaded yet
    if (!document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      // If script is already there, check if turnstile object is available
      if (window.turnstile) {
        setTimeout(() => setIsLoaded(true), 0);
      } else {
        // Fallback: poll for it
        const interval = setInterval(() => {
          if (window.turnstile) {
            setIsLoaded(true);
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoaded && containerRef.current && window.turnstile) {
      // Get sitekey from env, fallback to the one provided by user (it's public)
      const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACvOenD33V9zaniP';

      try {
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: sitekey,
          action: action,
          callback: (token: string) => {
            onVerify(token);
          },
          'error-callback': () => {
             console.error('Turnstile encountered an error.');
             onVerify('');
          },
          'expired-callback': () => {
             onVerify('');
          }
        });
      } catch (error) {
        console.error("Failed to render Turnstile widget:", error);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
            window.turnstile.remove(widgetIdRef.current);
        } catch {
            // ignore cleanup errors
        }
      }
    };
  }, [isLoaded, onVerify, action]);

  return <div ref={containerRef} className="my-4 flex justify-center w-full" />;
}

// Add TypeScript definition for the global turnstile object
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement | string, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}
