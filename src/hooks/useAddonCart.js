'use client';

import { useState, useCallback } from 'react';

/**
 * Shared logic for product cards that support addons + walls.
 *
 * Single source of truth used by every surface that renders a tent/product
 * card (home modal, category page, detail page, customize page) so the
 * addon-checkbox / walls-input behaviour stays in sync everywhere.
 */
export function useAddonCart() {
  const [selectedAddons, setSelectedAddons] = useState({});
  const [walls, setWalls] = useState({});

  const toggleAddon = useCallback((itemId, addonId) => {
    setSelectedAddons((prev) => {
      const key = `${itemId}_${addonId}`;
      return { ...prev, [key]: !prev[key] };
    });
  }, []);

  const isAddonSelected = useCallback(
    (itemId, addonId) => !!selectedAddons[`${itemId}_${addonId}`],
    [selectedAddons]
  );

  const getItemPrice = useCallback(
    (item) => {
      if (!item.addons) return item.price;
      return item.addons.reduce(
        (total, addon) =>
          selectedAddons[`${item.id}_${addon.id}`] ? total + addon.price : total,
        item.price
      );
    },
    [selectedAddons]
  );

  const setWallsQty = useCallback((itemId, value) => {
    if (value === '' || value === null || value === undefined) {
      setWalls((prev) => ({ ...prev, [itemId]: '' }));
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    setWalls((prev) => ({ ...prev, [itemId]: num }));
  }, []);

  const getWallsQty = useCallback((itemId) => walls[itemId] ?? 0, [walls]);

  /**
   * Build the cart payload for an item, applying any selected addons.
   * Returns { item, walls } where item is the (possibly-bundled) cart item
   * and walls is the integer number of wall panels to add as a separate item.
   */
  const buildCartPayload = useCallback(
    (item, { isEs }) => {
      const activeAddons = (item.addons || []).filter((a) =>
        selectedAddons[`${item.id}_${a.id}`]
      );
      const addonNames = activeAddons.map((a) => (isEs ? a.nameEs : a.name));
      const addonTotal = activeAddons.reduce((sum, a) => sum + a.price, 0);

      const cartItem = activeAddons.length > 0
        ? {
            ...item,
            id: `${item.id}-with-addons`,
            name: `${item.name} + ${addonNames.join(', ')}`,
            nameEs: `${item.nameEs || item.name} + ${addonNames.join(', ')}`,
            price: item.price + addonTotal,
          }
        : item;

      const wallsRaw = walls[item.id];
      const wallsParsed = parseInt(wallsRaw, 10);
      const wallsQty = Number.isNaN(wallsParsed) || wallsParsed < 1 ? 0 : wallsParsed;

      return { item: cartItem, walls: wallsQty };
    },
    [selectedAddons, walls]
  );

  return {
    selectedAddons,
    toggleAddon,
    isAddonSelected,
    getItemPrice,
    setWallsQty,
    getWallsQty,
    buildCartPayload,
  };
}

export const WALL_PRODUCT = {
  id: 'tent-wall',
  name: 'Tent Wall',
  nameEs: 'Pared para Carpa',
  price: 2.0,
  desc: 'Tent wall panel add-on.',
  descEs: 'Panel de pared para carpa.',
  image: '/tent10x20.webp',
};
