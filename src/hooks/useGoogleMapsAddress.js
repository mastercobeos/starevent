'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Warehouse origin: 3730 Redwood Falls Dr, Houston, TX 77082
const ORIGIN = { lat: 29.7233, lng: -95.5977 };
const DELIVERY_TIERS = [
  { maxMiles: 20, fee: 35 },
  { maxMiles: 40, fee: 60 },
  { maxMiles: 60, fee: 120 },
];
const MAX_DELIVERY_MILES = 60;

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error('No API key'));
  if (window._gmapsLoading) return window._gmapsLoading;
  window._gmapsLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return window._gmapsLoading;
}

/**
 * Manages Google Maps Places Autocomplete and delivery distance calculation.
 *
 * @param {object} opts
 * @param {boolean} opts.enabled    - true when autocomplete should be active (e.g. step === 'form')
 * @param {function} opts.onPlaceSelected - callback({ address, hasZip, miles, fee })
 * @returns {{ addressInputRef, deliveryFee, deliveryMiles, calculatingDelivery, addressVerified, resetAddress, MAX_DELIVERY_MILES }}
 */
export function useGoogleMapsAddress({ enabled, onPlaceSelected }) {
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [deliveryMiles, setDeliveryMiles] = useState(null);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMaps().then(() => setMapsLoaded(true)).catch(() => {});
  }, []);

  const calculateDistance = useCallback((place) => {
    if (!window.google?.maps || !place.geometry) return;
    setCalculatingDelivery(true);
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new window.google.maps.LatLng(ORIGIN.lat, ORIGIN.lng)],
        destinations: [place.geometry.location],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      },
      (response, status) => {
        setCalculatingDelivery(false);
        if (status === 'OK' && response.rows[0]?.elements[0]?.status === 'OK') {
          const distanceMeters = response.rows[0].elements[0].distance.value;
          const miles = Math.round(distanceMeters / 1609.34);
          setDeliveryMiles(miles);
          if (miles > MAX_DELIVERY_MILES) {
            setDeliveryFee(null);
          } else {
            const tier = DELIVERY_TIERS.find((t) => miles <= t.maxMiles);
            setDeliveryFee(tier.fee);
          }
        }
      }
    );
  }, []);

  // Init autocomplete
  useEffect(() => {
    if (!mapsLoaded || !addressInputRef.current || autocompleteRef.current) return;
    if (!enabled) return;
    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address', 'geometry', 'address_components'],
    });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        const zipComponent = place.address_components?.find((c) => c.types.includes('postal_code'));
        const hasZip = !!zipComponent?.short_name;
        setAddressVerified(hasZip);
        calculateDistance(place);
        if (onPlaceSelected) {
          onPlaceSelected({ address: place.formatted_address, hasZip });
        }
      }
    });
    autocompleteRef.current = autocomplete;
  }, [mapsLoaded, enabled]);

  const resetAddress = () => {
    setDeliveryFee(null);
    setDeliveryMiles(null);
    setAddressVerified(false);
  };

  return {
    addressInputRef,
    deliveryFee,
    deliveryMiles,
    calculatingDelivery,
    addressVerified,
    resetAddress,
    MAX_DELIVERY_MILES,
  };
}
