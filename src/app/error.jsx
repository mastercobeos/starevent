'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const t = {
  en: {
    title: 'Something Went Wrong',
    description: 'We\'re sorry, an unexpected error occurred. Please try again.',
    retry: 'Try Again',
    home: 'Go to Homepage',
  },
  es: {
    title: 'Algo Salió Mal',
    description: 'Lo sentimos, ocurrió un error inesperado. Por favor intenta de nuevo.',
    retry: 'Intentar de Nuevo',
    home: 'Ir al Inicio',
  },
};

export default function Error({ reset }) {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem('language');
    if (stored === 'es' || (!stored && navigator.language?.startsWith('es'))) {
      setLocale('es');
    }
  }, []);

  const text = t[locale];
  const prefix = locale === 'es' ? '/es' : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href={`${prefix}/`}>
            <Image
              src="/logo.png"
              alt="Star Event Rental"
              width={140}
              height={56}
              className="h-10 sm:h-12 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="text-center max-w-lg">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <h1 className="text-foreground text-2xl sm:text-3xl font-bold">
            {text.title}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mt-3 leading-relaxed">
            {text.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-bold transition-colors border-2 border-[#C9A84C] shadow-lg hover:shadow-xl w-full sm:w-auto cursor-pointer"
            >
              {text.retry}
            </button>
            <Link
              href={`${prefix}/`}
              className="inline-flex items-center justify-center rounded-lg border border-border hover:bg-accent text-foreground px-8 py-3 text-base font-medium transition-colors w-full sm:w-auto"
            >
              {text.home}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
