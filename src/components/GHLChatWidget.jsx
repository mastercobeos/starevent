'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Pages that have forms collecting phone numbers or SMS consent
const EXCLUDED_PATHS = ['/contact', '/admin'];

export default function GHLChatWidget() {
  const pathname = usePathname();

  const isExcluded = EXCLUDED_PATHS.some((path) => pathname.includes(path));

  useEffect(() => {
    if (isExcluded) return;

    const existingScript = document.querySelector('script[data-widget-id="69cb11a36e638bee70f0798e"]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.src = 'https://widgets.leadconnectorhq.com/loader.js';
    script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
    script.setAttribute('data-widget-id', '69cb11a36e638bee70f0798e');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      // Clean up widget container if it exists
      const widgetContainer = document.getElementById('chat-widget-container');
      if (widgetContainer) widgetContainer.remove();
    };
  }, [isExcluded]);

  return null;
}
