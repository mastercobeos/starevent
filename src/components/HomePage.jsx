'use client';

import React, { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { translations } from '../translations';
import { productCards } from '../data/homeData';
import { HeroSection } from './home/HeroSection';
import { FeaturesSection } from './home/FeaturesSection';
import { PackagesPreview } from './home/PackagesPreview';
import { ProductsSection } from './home/ProductsSection';
import { AboutSection } from './home/AboutSection';
import { ReviewsSection } from './home/ReviewsSection';

const PackagesModal = lazy(() => import('./home/PackagesModal').then(m => ({ default: m.PackagesModal })));
const ProductModal = lazy(() => import('./home/ProductModal').then(m => ({ default: m.ProductModal })));

function parseProductHash() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.slice(1);
  if (!hash.startsWith('product/')) return null;
  const parts = hash.split('/');
  const slug = parts[1];
  const itemId = parts[2] || null;
  const categoryIdx = productCards.findIndex(p => p.slug === slug);
  if (categoryIdx === -1) return null;
  return { categoryIdx, itemId };
}

function setProductHash(categoryIdx, itemId) {
  const slug = productCards[categoryIdx]?.slug;
  if (!slug) return;
  const hash = itemId ? `#product/${slug}/${itemId}` : `#product/${slug}`;
  window.history.replaceState(null, '', hash);
}

function clearProductHash() {
  if (window.location.hash.startsWith('#product/')) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

export default function Home() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const t = translations[language].home;
  const tc = translations[language].cart;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('Deluxe');
  const [productModal, setProductModal] = useState(null);
  const [initialItemId, setInitialItemId] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState(null);
  const [quantities, setQuantities] = useState({});
  const isFromHash = useRef(false);

  const getQty = (id) => quantities[id] || 1;
  const setQty = (id, val) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));

  // Parse hash on mount to open modal from shared URL
  useEffect(() => {
    const parsed = parseProductHash();
    if (parsed) {
      isFromHash.current = true;
      setProductModal(parsed.categoryIdx);
      if (parsed.itemId) setInitialItemId(parsed.itemId);
      setTimeout(() => {
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    const handleHashChange = () => {
      const parsed = parseProductHash();
      if (parsed) {
        isFromHash.current = true;
        setProductModal(parsed.categoryIdx);
        if (parsed.itemId) setInitialItemId(parsed.itemId);
      } else if (!window.location.hash.startsWith('#product/')) {
        setProductModal(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Signal Layout to hide social buttons when any modal is open
  useEffect(() => {
    document.body.dataset.modalOpen = (showModal || productModal !== null) ? 'true' : '';
    return () => { document.body.dataset.modalOpen = ''; };
  }, [showModal, productModal]);

  // Sync URL hash when modal opens/closes
  useEffect(() => {
    if (isFromHash.current) {
      isFromHash.current = false;
      return;
    }
    if (productModal !== null) {
      setProductHash(productModal, null);
    } else {
      clearProductHash();
    }
  }, [productModal]);

  const handleSelectPackage = useCallback((type) => {
    setModalType(type);
    setShowModal(true);
  }, []);

  const handleSelectProduct = useCallback((idx) => {
    setProductModal(idx);
  }, []);

  const handleItemVisible = useCallback((itemId) => {
    if (productModal !== null) {
      setProductHash(productModal, itemId);
    }
  }, [productModal]);

  const handleCloseProductModal = useCallback((val) => {
    setProductModal(val);
    setInitialItemId(null);
    clearProductHash();
  }, []);

  return (
    <div>
      <HeroSection t={t} />
      <FeaturesSection t={t} />
      <PackagesPreview t={t} onSelectPackage={handleSelectPackage} language={language} />
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
            setProductModal={handleCloseProductModal}
            language={language}
            addItem={addItem}
            tc={tc}
            quantities={quantities}
            getQty={getQty}
            setQty={setQty}
            addedFeedback={addedFeedback}
            setAddedFeedback={setAddedFeedback}
            initialItemId={initialItemId}
            onItemVisible={handleItemVisible}
          />
        )}
      </Suspense>
    </div>
  );
}
