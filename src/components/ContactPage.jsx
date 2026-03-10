'use client';

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { BackgroundSection } from '../components/ui/BackgroundSection';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { getTrafficSourceLabel } from '../lib/utm-tracking';

const BG_IMAGE = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export default function Contact() {
  const { language } = useLanguage();
  const t = translations[language].contact;

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    package: '',
    message: '',
    consent1: false,
    consent2: false
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent1) {
      alert(t.consentRequired);
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          package: formData.package,
          message: formData.message,
          trafficSource: getTrafficSourceLabel(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send');

      alert(t.thankYou(formData.fullName, formData.phone));
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        package: '',
        message: '',
        consent1: false,
        consent2: false
      });
    } catch {
      alert(language === 'en'
        ? 'There was an error sending your message. Please try again or call us at 281-636-0615.'
        : 'Hubo un error al enviar tu mensaje. Intenta de nuevo o llámanos al 281-636-0615.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div>
      <BackgroundSection imageSrc={BG_IMAGE} className="-mt-[3.2rem] sm:-mt-16 md:-mt-[4.8rem] pt-[calc(3.2rem+5rem)] sm:pt-[calc(4rem+5rem)] md:pt-[calc(4.8rem+5rem)] pb-20 text-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{t.contactTitle}</h1>
              <p className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed">
                {t.readyToPlan}
              </p>
              <ul className="space-y-4 mb-8 text-white/90">
                <li><strong>📍 {t.location}</strong> Houston 77082, USA</li>
                <li><strong>📞 {t.phone}</strong> <a href="tel:2816360615" className="underline hover:text-primary transition-colors">281-636-0615</a></li>
                <li><strong>✉️ {t.email}</strong> <a href="mailto:info@stareventrentaltx.com" className="underline hover:text-primary transition-colors">info@stareventrentaltx.com</a></li>
                <li><strong>🌎 {t.serviceAreas}</strong> {t.serviceAreasDesc}</li>
              </ul>
              <div
                className="p-4 rounded-2xl border border-white/15"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                  backdropFilter: 'blur(12px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                }}
              >
                <p className="italic text-white/80 text-sm sm:text-base leading-relaxed">
                  &ldquo;{translations[language].common.inspirationalQuote}&rdquo;
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-2xl border-2 border-[#C9A84C] shadow-xl"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
                backdropFilter: 'blur(8px) saturate(180%)',
                WebkitBackdropFilter: 'blur(8px) saturate(180%)',
              }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 text-center">{t.bookNow}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder={t.fullName}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-[#C9A84C] text-white placeholder:text-white/50 transition-colors"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={t.phonePlaceholder}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-[#C9A84C] text-white placeholder:text-white/50 transition-colors"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-[#C9A84C] text-white placeholder:text-white/50 transition-colors"
              />
              <select
                name="package"
                value={formData.package}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-[#C9A84C] text-white transition-colors [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="" className="text-white/50">{t.selectPackage}</option>
                <option value="Basic 20x20 - $399">{t.package1}</option>
                <option value="Delux 20x20 - $749">{t.package2}</option>
                <option value="Basic 20x40 - $849">{t.package3}</option>
                <option value="Delux 20x40 - $1,299">{t.package4}</option>
                <option value="Custom">{translations[language].common.customPackage}</option>
              </select>
              <textarea
                name="message"
                rows="4"
                placeholder={t.message}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/20 bg-white/10 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-[#C9A84C] text-white placeholder:text-white/50 transition-colors"
              />
              <div className="mb-4">
                <label className="flex gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    name="consent1"
                    checked={formData.consent1}
                    onChange={handleChange}
                    required
                    className="mt-1 accent-[#C9A84C]"
                  />
                  <span>{t.consent1}</span>
                </label>
              </div>
              <div className="mb-6">
                <label className="flex gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    name="consent2"
                    checked={formData.consent2}
                    onChange={handleChange}
                    className="mt-1 accent-[#C9A84C]"
                  />
                  <span>{t.consent2}</span>
                </label>
              </div>
              <Button type="submit" disabled={sending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base shadow-lg hover:shadow-xl transition-[box-shadow] border-2 border-[#C9A84C] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
                {sending
                  ? (language === 'en' ? 'Sending...' : 'Enviando...')
                  : t.bookNow
                }
              </Button>
            </form>
          </div>
        </div>
      </BackgroundSection>
    </div>
  );
}
