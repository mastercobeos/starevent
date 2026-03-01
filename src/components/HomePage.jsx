'use client';

import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { translations } from '../translations';
import { HeroSection } from './home/HeroSection';
import { FeaturesSection } from './home/FeaturesSection';
import { PackagesPreview } from './home/PackagesPreview';
import { ProductsSection } from './home/ProductsSection';
import { AboutSection } from './home/AboutSection';
import { ReviewsSection } from './home/ReviewsSection';

const PackagesModal = lazy(() => import('./home/PackagesModal').then(m => ({ default: m.PackagesModal })));
const ProductModal = lazy(() => import('./home/ProductModal').then(m => ({ default: m.ProductModal })));

export default function Home() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const t = translations[language].home;
  const tc = translations[language].cart;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('Deluxe');
  const [productModal, setProductModal] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(null);
  const [quantities, setQuantities] = useState({});

  const getQty = (id) => quantities[id] || 1;
  const setQty = (id, val) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  const handleSelectPackage = useCallback((type) => {
    setModalType(type);
    setShowModal(true);
  }, []);

  const handleSelectProduct = useCallback((idx) => {
    setProductModal(idx);
  }, []);

  return (
    <div>
      <HeroSection t={t} />
      <FeaturesSection t={t} />
      <PackagesPreview t={t} onSelectPackage={handleSelectPackage} />
      <ProductsSection language={language} onSelectProduct={handleSelectProduct} />
      <AboutSection language={language} />
      <ReviewsSection t={t} />
      <Suspense fallback={null}>
        {showModal && (
          <PackagesModal
            showModal={showModal}
            setShowModal={setShowModal}
            modalType={modalType}
            language={language}
            addItem={addItem}
            tc={tc}
            t={t}
            quantities={quantities}
            getQty={getQty}
            setQty={setQty}
            addedFeedback={addedFeedback}
            setAddedFeedback={setAddedFeedback}
          />
        )}
        {productModal !== null && (
          <ProductModal
            productModal={productModal}
            setProductModal={setProductModal}
            language={language}
            addItem={addItem}
            tc={tc}
            quantities={quantities}
            getQty={getQty}
            setQty={setQty}
            addedFeedback={addedFeedback}
            setAddedFeedback={setAddedFeedback}
          />
        )}
      </Suspense>
    </div>
  );
}
