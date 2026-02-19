import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent1) {
      alert(language === 'es' ? 'Por favor, consiente recibir mensajes transaccionales para continuar.' : 'Please consent to receive transactional messages to proceed.');
      return;
    }
    
    const successMessage = t.thankYou(formData.fullName, formData.phone);
    
    alert(successMessage);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      package: '',
      message: '',
      consent1: false,
      consent2: false
    });
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
      <section className="relative py-20 overflow-hidden text-foreground">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.65)), url(https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-4xl font-bold mb-4">{t.contactTitle}</h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t.readyToPlan}
              </p>
              <ul className="space-y-4 mb-8">
                <li><strong>📍 {t.location}</strong> Houston 77082, USA</li>
                <li><strong>📞 {t.phone}</strong> <a href="tel:2816360615" className="underline hover:text-primary">281-636-0615</a></li>
                <li><strong>✉️ {t.email}</strong> <a href="mailto:info@stareventrentaltx.com" className="underline hover:text-primary">info@stareventrentaltx.com</a></li>
                <li><strong>🌎 {t.serviceAreas}</strong> {t.serviceAreasDesc}</li>
              </ul>
              <div className="bg-primary/20 p-4 rounded-lg border-l-4 border-primary">
                <p className="italic text-muted-foreground">
                  "En Star Event Rental, convertimos tus momentos especiales en recuerdos duraderos con la excelencia de un servicio profesional."
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg text-card-foreground">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">{t.bookNow}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder={t.fullName}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={t.phonePlaceholder}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
              <select
                name="package"
                value={formData.package}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="">{t.selectPackage}</option>
                <option value="Basic 20x20 - $399">Package 1: Basic 20x20 - $399</option>
                <option value="Delux 20x20 - $749">Package 2: Delux 20x20 - $749</option>
                <option value="Basic 20x40 - $849">Package 3: Basic 20x40 - $849</option>
                <option value="Delux 20x40 - $1,299">Package 4: Delux 20x40 - $1,299</option>
                <option value="Custom">Custom Package</option>
              </select>
              <textarea
                name="message"
                rows="4"
                placeholder={t.message}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-input bg-background rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
              <div className="mb-4">
                <label className="flex gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="consent1"
                    checked={formData.consent1}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                  <span>{t.consent1}</span>
                </label>
              </div>
              <div className="mb-6">
                <label className="flex gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="consent2"
                    checked={formData.consent2}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span>{t.consent2}</span>
                </label>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                {t.bookNow}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
