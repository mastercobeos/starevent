'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children, initialLocale }) => {
  const [language, setLanguage] = useState(initialLocale || 'en');

  useEffect(() => {
    if (initialLocale) return;
    const stored = localStorage.getItem('star-event-lang');
    if (stored === 'en' || stored === 'es') {
      setLanguage(stored);
      return;
    }
    if (navigator.language?.startsWith('es')) {
      setLanguage('es');
    }
  }, [initialLocale]);

  useEffect(() => {
    localStorage.setItem('star-event-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    // Navigate to the locale-based URL
    const { pathname } = window.location;
    if (newLang === 'es') {
      // Going to Spanish: add /es prefix
      const cleanPath = pathname.replace(/^\/(en|es)/, '') || '/';
      window.location.href = `/es${cleanPath === '/' ? '' : cleanPath}`;
    } else {
      // Going to English: remove /es prefix
      const cleanPath = pathname.replace(/^\/es/, '') || '/';
      window.location.href = cleanPath;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
