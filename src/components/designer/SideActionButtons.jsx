'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Spotlight, Lightbulb, Home } from 'lucide-react';

const SLIDER_AUTO_HIDE_MS = 3000;

function RoundButton({ active, onClick, title, children, highlight = 'primary' }) {
  const activeBg = highlight === 'warm'
    ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 ring-amber-300/60 shadow-amber-400/30'
    : 'bg-[#C9A84C] hover:bg-[#d9b85c] text-slate-900 ring-[#C9A84C]/50 shadow-[#C9A84C]/30';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`
        group relative w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-200 backdrop-blur-md border
        ${active
          ? `${activeBg} border-white/50 ring-2 shadow-lg`
          : 'bg-slate-900/60 hover:bg-slate-800/80 text-white/85 border-white/15 shadow-md'}
      `}
    >
      {children}
      <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900/95 px-2 py-1 text-[11px] text-white opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
        {title}
      </span>
    </button>
  );
}

export default function SideActionButtons({
  t, mode, lightsEnabled, theaterLightEnabled, theaterLightIntensity = 1,
  tentPickerOpen,
  onToggleMode, onToggleLights, onToggleTheaterLight, onChangeTheaterIntensity,
  onToggleTentPicker,
}) {
  const isNight = mode === 'night';
  const [sliderVisible, setSliderVisible] = useState(false);
  const hideTimerRef = useRef(null);

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setSliderVisible(false), SLIDER_AUTO_HIDE_MS);
  };

  const revealSlider = () => {
    setSliderVisible(true);
    scheduleHide();
  };

  useEffect(() => {
    if (theaterLightEnabled) {
      revealSlider();
    } else {
      setSliderVisible(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [theaterLightEnabled]);

  const handleTheaterButtonClick = () => {
    if (theaterLightEnabled && !sliderVisible) {
      revealSlider();
      return;
    }
    onToggleTheaterLight();
  };
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 md:left-5">
      <RoundButton
        active={isNight}
        onClick={onToggleMode}
        title={isNight ? t.dayMode : t.nightMode}
        highlight={isNight ? 'primary' : 'warm'}
      >
        {isNight
          ? <Moon className="w-5 h-5" />
          : <Sun className="w-5 h-5" />}
      </RoundButton>

      <div
        className="flex items-center gap-2"
        onMouseEnter={theaterLightEnabled ? revealSlider : undefined}
      >
        <RoundButton
          active={theaterLightEnabled}
          onClick={handleTheaterButtonClick}
          title={t.theaterLight}
        >
          <Spotlight className="w-5 h-5" />
        </RoundButton>

        {theaterLightEnabled && sliderVisible && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/75 border border-white/15 backdrop-blur-md shadow-md transition-opacity"
            title={`${t.theaterLight} · ${Math.round(theaterLightIntensity * 100)}%`}
            onPointerDown={revealSlider}
          >
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={theaterLightIntensity}
              onChange={(e) => {
                onChangeTheaterIntensity(parseFloat(e.target.value));
                revealSlider();
              }}
              aria-label={t.theaterLight}
              className="designer-intensity-slider w-24 md:w-28 accent-[#C9A84C]"
            />
            <span className="text-white/80 text-[10px] font-semibold w-8 text-right tabular-nums">
              {Math.round(theaterLightIntensity * 100)}%
            </span>
          </div>
        )}
      </div>

      <RoundButton
        active={lightsEnabled}
        onClick={onToggleLights}
        title={t.stringLights}
      >
        <Lightbulb className="w-5 h-5" />
      </RoundButton>

      <RoundButton
        active={tentPickerOpen}
        onClick={onToggleTentPicker}
        title={t.pickTent || 'Tents'}
      >
        <Home className="w-5 h-5" />
      </RoundButton>
    </div>
  );
}
