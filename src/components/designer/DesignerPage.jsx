'use client';

import { useReducer, useState, useCallback, useEffect, useRef, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations';
import Toolbar from './Toolbar';
import SelectionHud from './SelectionHud';
import QuoteModal from './QuoteModal';
import SideActionButtons from './SideActionButtons';
import TentPickerPanel from './TentPickerPanel';
import { getCatalogItem, getSpawnPosition, clampItemsToScene } from './items';
import { TENTS, getTentById, getSeatedCapacity, resolveTent, getNextTentPosition } from './tents';
import { loadDesignerState, saveDesignerState, clearDesignerState } from './storage';

const DesignerCanvas = dynamic(() => import('./DesignerCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-200 to-emerald-100">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  ),
});

const initialState = { items: [], history: [[]], historyIndex: 0 };
const NUDGE_STEP = 0.5;
const DEFAULT_TENT_TYPE = 'tent-20x40';

function makeDefaultTent() {
  return {
    instanceId: `tent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    typeId: DEFAULT_TENT_TYPE,
    x: 0,
    z: 0,
    rotation: 0,
  };
}

function commit(state, items) {
  const truncated = state.history.slice(0, state.historyIndex + 1);
  return { items, history: [...truncated, items], historyIndex: truncated.length };
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return commit(state, [...state.items, action.item]);
    case 'REMOVE':
      return commit(state, state.items.filter((i) => i.id !== action.id));
    case 'REMOVE_LAST_OF_TYPE': {
      const idx = state.items.findLastIndex((i) => i.type === action.itemType);
      if (idx === -1) return state;
      return commit(state, state.items.filter((_, i) => i !== idx));
    }
    case 'CLEAR':
      return commit(state, []);
    case 'REPLACE_ALL':
      return commit(state, action.items);
    case 'LOAD':
      return {
        items: action.items,
        history: [[], action.items],
        historyIndex: 1,
      };
    case 'ROTATE':
      return commit(
        state,
        state.items.map((i) =>
          i.id === action.id ? { ...i, rotation: (i.rotation || 0) + action.delta } : i
        )
      );
    case 'TOGGLE_CLOTH':
      return commit(
        state,
        state.items.map((i) =>
          i.id === action.id ? { ...i, tableclothed: !i.tableclothed } : i
        )
      );
    case 'DUPLICATE': {
      const src = state.items.find((i) => i.id === action.id);
      if (!src) return state;
      const copy = {
        ...src,
        id: `${src.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x: src.x + 1.5,
        z: src.z + 1.5,
      };
      return commit(state, [...state.items, copy]);
    }
    case 'NUDGE':
      return commit(
        state,
        state.items.map((i) =>
          i.id === action.id
            ? { ...i, x: i.x + action.dx, z: i.z + action.dz }
            : i
        )
      );
    case 'MOVE_LIVE':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, x: action.x, z: action.z } : i
        ),
      };
    case 'MOVE_COMMIT': {
      const truncated = state.history.slice(0, state.historyIndex + 1);
      return { ...state, history: [...truncated, state.items], historyIndex: truncated.length };
    }
    case 'UNDO': {
      if (state.historyIndex === 0) return state;
      const newIndex = state.historyIndex - 1;
      return { ...state, items: state.history[newIndex], historyIndex: newIndex };
    }
    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return { ...state, items: state.history[newIndex], historyIndex: newIndex };
    }
    default:
      return state;
  }
}

export default function DesignerPage() {
  const { language } = useLanguage();
  const t = translations[language].designer;

  const [tents, setTents] = useState(() => [makeDefaultTent()]);
  const [selectedTentInstanceId, setSelectedTentInstanceId] = useState(() => tents[0].instanceId);
  const [selectedId, setSelectedId] = useState(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [lightsEnabled, setLightsEnabled] = useState(false);
  const [theaterLightEnabled, setTheaterLightEnabled] = useState(false);
  const [theaterLightIntensity, setTheaterLightIntensity] = useState(1);
  const [mode, setMode] = useState('day');
  const [tentPickerOpen, setTentPickerOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const { items, historyIndex, history } = state;
  const snapshotRef = useRef(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const selectedTent = useMemo(() => {
    const placed = tents.find((t) => t.instanceId === selectedTentInstanceId) || tents[0];
    return resolveTent(placed);
  }, [tents, selectedTentInstanceId]);

  const chairsInLayout = items.filter((it) =>
    it.type === 'chiavari' || it.type === 'kid-chiavari' || it.type === 'garden' ||
    it.type === 'resin' || it.type === 'wooden'
  ).length;
  const tentCapacity = useMemo(() => {
    return tents.reduce((sum, placed) => sum + getSeatedCapacity(getTentById(placed.typeId)), 0);
  }, [tents]);
  const isOverCapacity = chairsInLayout > tentCapacity;

  useEffect(() => {
    const saved = loadDesignerState();
    if (saved) {
      if (Array.isArray(saved.tents) && saved.tents.length > 0) {
        setTents(saved.tents);
        if (saved.selectedTentInstanceId) {
          const exists = saved.tents.some((t) => t.instanceId === saved.selectedTentInstanceId);
          setSelectedTentInstanceId(exists ? saved.selectedTentInstanceId : saved.tents[0].instanceId);
        } else {
          setSelectedTentInstanceId(saved.tents[0].instanceId);
        }
      } else if (saved.tentId) {
        const migrated = {
          instanceId: `tent-${Date.now()}-migrated`,
          typeId: saved.tentId,
          x: 0, z: 0, rotation: 0,
        };
        setTents([migrated]);
        setSelectedTentInstanceId(migrated.instanceId);
      }
      if (Array.isArray(saved.items) && saved.items.length > 0) {
        dispatch({ type: 'LOAD', items: saved.items });
      }
      if (typeof saved.lightsEnabled === 'boolean') {
        setLightsEnabled(saved.lightsEnabled);
      }
      if (typeof saved.theaterLightEnabled === 'boolean') {
        setTheaterLightEnabled(saved.theaterLightEnabled);
      }
      if (typeof saved.snapEnabled === 'boolean') {
        setSnapEnabled(saved.snapEnabled);
      }
      if (saved.mode === 'day' || saved.mode === 'night') {
        setMode(saved.mode);
      }
      if (typeof saved.theaterLightIntensity === 'number' && isFinite(saved.theaterLightIntensity)) {
        setTheaterLightIntensity(Math.max(0, Math.min(2, saved.theaterLightIntensity)));
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDesignerState({
      tents,
      selectedTentInstanceId,
      items,
      lightsEnabled,
      theaterLightEnabled,
      theaterLightIntensity,
      snapEnabled,
      mode,
    });
  }, [hydrated, tents, selectedTentInstanceId, items, lightsEnabled, theaterLightEnabled, theaterLightIntensity, snapEnabled, mode]);

  const handleToggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'day' ? 'night' : 'day';
      if (next === 'night') {
        setLightsEnabled(true);
        setTheaterLightEnabled(true);
      } else {
        setLightsEnabled(false);
        setTheaterLightEnabled(false);
      }
      return next;
    });
  }, []);

  const handleAddTent = useCallback((typeId = DEFAULT_TENT_TYPE) => {
    const resolvedType = typeof typeId === 'string' ? typeId : DEFAULT_TENT_TYPE;
    const pos = getNextTentPosition(tents, resolvedType);
    const newTent = {
      instanceId: `tent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      typeId: resolvedType,
      x: pos.x,
      z: pos.z,
      rotation: 0,
    };
    setTents((prev) => [...prev, newTent]);
    setSelectedTentInstanceId(newTent.instanceId);
  }, [tents]);

  const handleRemoveTent = useCallback((instanceId) => {
    if (tents.length <= 1) return;
    setTents((prev) => {
      const next = prev.filter((t) => t.instanceId !== instanceId);
      if (selectedTentInstanceId === instanceId) {
        setSelectedTentInstanceId(next[0].instanceId);
      }
      return next;
    });
  }, [tents.length, selectedTentInstanceId]);

  const handleChangeTentType = useCallback((instanceId, typeId) => {
    setTents((prev) => prev.map((t) => (t.instanceId === instanceId ? { ...t, typeId } : t)));
  }, []);

  const handleMoveTentLive = useCallback((instanceId, x, z) => {
    setTents((prev) => prev.map((t) => (t.instanceId === instanceId ? { ...t, x, z } : t)));
  }, []);

  const handleMoveTentCommit = useCallback(() => {}, []);

  const handleTentDoubleClick = useCallback((placed) => {
    setTents((prev) => prev.map((t) =>
      t.instanceId === placed.instanceId
        ? { ...t, wallsRetracted: !t.wallsRetracted }
        : t
    ));
  }, []);

  const handleAdd = useCallback((type) => {
    const catalog = getCatalogItem(type);
    if (!catalog) return;
    if (catalog.unique && items.some((it) => it.type === type)) return;

    const pos = getSpawnPosition(items, selectedTent, type);
    const newItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      x: pos.x,
      z: pos.z,
      rotation: 0,
    };
    dispatch({ type: 'ADD', item: newItem });
    setSelectedId(newItem.id);
  }, [items, selectedTent]);

  const handleRemove = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const handleRemoveType = useCallback((type) => {
    dispatch({ type: 'REMOVE_LAST_OF_TYPE', itemType: type });
  }, []);

  const handleClearAll = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    setSelectedId(null);
  }, []);

  const handleResetSaved = useCallback(() => {
    clearDesignerState();
    dispatch({ type: 'CLEAR' });
    const fresh = makeDefaultTent();
    setTents([fresh]);
    setSelectedTentInstanceId(fresh.instanceId);
    setSelectedId(null);
    setLightsEnabled(false);
    setTheaterLightEnabled(false);
    setMode('day');
  }, []);

  const handleApplyPackage = useCallback((pkgItems) => {
    const offsetX = selectedTent.x;
    const offsetZ = selectedTent.z;
    const offset = pkgItems.map((it) => ({ ...it, x: it.x + offsetX, z: it.z + offsetZ }));
    const clamped = clampItemsToScene(offset);
    dispatch({ type: 'REPLACE_ALL', items: clamped });
    setSelectedId(null);
  }, [selectedTent]);

  const handleApplyWizard = useCallback(({ tent: typeOrPlaced, items: wizItems }) => {
    const typeId = typeOrPlaced.id || typeOrPlaced.typeId || DEFAULT_TENT_TYPE;
    setTents((prev) => {
      const idx = prev.findIndex((t) => t.instanceId === selectedTentInstanceId);
      if (idx === -1) return prev;
      const updated = { ...prev[idx], typeId };
      return [...prev.slice(0, idx), updated, ...prev.slice(idx + 1)];
    });
    const placedCurrent = tents.find((t) => t.instanceId === selectedTentInstanceId);
    const offsetX = placedCurrent?.x || 0;
    const offsetZ = placedCurrent?.z || 0;
    const offset = wizItems.map((it) => ({ ...it, x: it.x + offsetX, z: it.z + offsetZ }));
    const clamped = clampItemsToScene(offset);
    dispatch({ type: 'REPLACE_ALL', items: clamped });
    setSelectedId(null);
  }, [selectedTentInstanceId, tents]);

  const handleMoveLive = useCallback((id, x, z) => {
    dispatch({ type: 'MOVE_LIVE', id, x, z });
  }, []);

  const handleMoveCommit = useCallback(() => {
    dispatch({ type: 'MOVE_COMMIT' });
  }, []);

  const handleRotate = useCallback((delta) => {
    if (!selectedId) return;
    dispatch({ type: 'ROTATE', id: selectedId, delta });
  }, [selectedId]);

  const handleToggleCloth = useCallback(() => {
    if (!selectedId) return;
    dispatch({ type: 'TOGGLE_CLOTH', id: selectedId });
  }, [selectedId]);

  const handleDuplicate = useCallback(() => {
    if (!selectedId) return;
    dispatch({ type: 'DUPLICATE', id: selectedId });
  }, [selectedId]);

  const handleNudge = useCallback((dx, dz) => {
    if (!selectedId) return;
    dispatch({ type: 'NUDGE', id: selectedId, dx, dz });
  }, [selectedId]);

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' });
    setSelectedId(null);
  }, []);

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' });
    setSelectedId(null);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedId) handleRemove(selectedId);
  }, [selectedId, handleRemove]);

  const handleTakeSnapshot = useCallback(() => {
    return snapshotRef.current?.() || null;
  }, []);

  const handleDownload = useCallback(() => {
    const dataUrl = snapshotRef.current?.();
    if (!dataUrl) return;
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.download = `star-event-layout-${stamp}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const selectedItem = items.find((it) => it.id === selectedId) || null;

  useEffect(() => {
    const isTypingTarget = (el) => {
      const tag = el?.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable;
    };

    const handler = (e) => {
      if (isTypingTarget(e.target)) return;
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (ctrlOrMeta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault(); handleUndo(); return;
      }
      if (ctrlOrMeta && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault(); handleRedo(); return;
      }
      if (ctrlOrMeta && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault(); handleDuplicate(); return;
      }
      if (e.key === 'Escape') {
        setSelectedId(null); return;
      }
      if (!selectedId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault(); handleDeleteSelected();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotate(e.shiftKey ? -Math.PI / 8 : Math.PI / 8);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault(); handleToggleCloth();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); handleNudge(0, -NUDGE_STEP);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault(); handleNudge(0, NUDGE_STEP);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); handleNudge(-NUDGE_STEP, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault(); handleNudge(NUDGE_STEP, 0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, handleUndo, handleRedo, handleRotate, handleDeleteSelected,
      handleToggleCloth, handleDuplicate, handleNudge]);

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 3.2rem)' }}>
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <DesignerCanvas
            tents={tents}
            selectedTentInstanceId={selectedTentInstanceId}
            items={items}
            selectedId={selectedId}
            snapEnabled={snapEnabled}
            lightsEnabled={lightsEnabled}
            theaterLightEnabled={theaterLightEnabled}
            theaterLightIntensity={theaterLightIntensity}
            mode={mode}
            onSelect={setSelectedId}
            onSelectTent={setSelectedTentInstanceId}
            onMoveLive={handleMoveLive}
            onMoveCommit={handleMoveCommit}
            onMoveTentLive={handleMoveTentLive}
            onMoveTentCommit={handleMoveTentCommit}
            onDoubleClickTent={handleTentDoubleClick}
            onDoubleClickItem={(it) => setSelectedId(it.id)}
            snapshotRef={snapshotRef}
          />
        </Suspense>
      </div>

      <Toolbar
        t={t}
        language={language}
        tents={tents}
        tent={selectedTent}
        selectedTentInstanceId={selectedTentInstanceId}
        tentCatalog={TENTS}
        items={items}
        snapEnabled={snapEnabled}
        lightsEnabled={lightsEnabled}
        theaterLightEnabled={theaterLightEnabled}
        canUndo={canUndo}
        canRedo={canRedo}
        chairsInLayout={chairsInLayout}
        tentCapacity={tentCapacity}
        isOverCapacity={isOverCapacity}
        onSelectTent={setSelectedTentInstanceId}
        onAddTent={handleAddTent}
        onRemoveTent={handleRemoveTent}
        onChangeTentType={handleChangeTentType}
        onAdd={handleAdd}
        onRemoveType={handleRemoveType}
        onClearAll={handleClearAll}
        onResetSaved={handleResetSaved}
        onApplyPackage={handleApplyPackage}
        onApplyWizard={handleApplyWizard}
        onToggleSnap={() => setSnapEnabled((s) => !s)}
        onToggleLights={() => setLightsEnabled((s) => !s)}
        onToggleTheaterLight={() => setTheaterLightEnabled((s) => !s)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenQuote={() => setQuoteOpen(true)}
        onDownload={handleDownload}
      />

      <SelectionHud
        t={t}
        visible={!!selectedId}
        selectedItem={selectedItem}
        onRotate={handleRotate}
        onDelete={handleDeleteSelected}
        onDeselect={() => setSelectedId(null)}
        onToggleCloth={handleToggleCloth}
        onDuplicate={handleDuplicate}
      />

      <SideActionButtons
        t={t}
        mode={mode}
        lightsEnabled={lightsEnabled}
        theaterLightEnabled={theaterLightEnabled}
        theaterLightIntensity={theaterLightIntensity}
        tentPickerOpen={tentPickerOpen}
        onToggleMode={handleToggleMode}
        onToggleLights={() => setLightsEnabled((s) => !s)}
        onToggleTheaterLight={() => setTheaterLightEnabled((s) => !s)}
        onChangeTheaterIntensity={setTheaterLightIntensity}
        onToggleTentPicker={() => setTentPickerOpen((s) => !s)}
      />

      <TentPickerPanel
        t={t}
        language={language}
        open={tentPickerOpen}
        tentCatalog={TENTS}
        onClose={() => setTentPickerOpen(false)}
        onPick={(typeId) => {
          handleAddTent(typeId);
          setTentPickerOpen(false);
        }}
      />

      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        t={t}
        language={language}
        tents={tents}
        items={items}
        onTakeSnapshot={handleTakeSnapshot}
      />

      <div className="pointer-events-none absolute top-4 left-4 md:top-6 md:left-6 z-10 max-w-[60%]">
        <h1 className="text-white text-lg md:text-2xl font-bold drop-shadow-lg">
          {t.pageTitle}
        </h1>
        <p className="text-white/90 text-xs md:text-sm mt-1 drop-shadow-md">
          {t.pageSubtitle}
        </p>
      </div>
    </div>
  );
}
