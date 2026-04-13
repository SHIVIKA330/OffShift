"use client";

import { useEffect, useState } from "react";

export function HeroWeather({ zone = "delhi_new" }: { zone?: string }) {
  const [weatherStatus, setWeatherStatus] = useState<{
    rain_mm: number;
    temp_c: number;
    aqi: number;
    is_rain_alert: boolean;
    is_heat_alert: boolean;
    is_aqi_alert: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`/api/weather-status?zone=${zone}`);
        if (res.ok) {
          const data = await res.json();
          setWeatherStatus(data);
        }
      } catch (e) {
        console.error("Hero Weather fetch failed", e);
      }
    };
    void fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [zone]);

  if (!weatherStatus) {
    return (
      <div className="flex justify-center items-center h-20 gap-4 opacity-50">
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }}></div>
        <div className="w-4 h-4 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
      </div>
    );
  }

  return (
    <div className="bg-surface/90 backdrop-blur-md p-4 rounded-3xl editorial-shadow border border-outline-variant/10 max-w-sm mx-auto mt-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-error opacity-50"></div>
      <div className="flex justify-between items-center mb-3 px-2">
        <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Live Conditions (Delhi NCR)
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${weatherStatus.is_rain_alert ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface'}`}>
          <span className="material-symbols-outlined mb-1 text-lg" style={{ fontVariationSettings: weatherStatus.is_rain_alert ? "'FILL' 1" : "'FILL' 0" }}>water_drop</span>
          <span className="font-headline font-semibold text-sm">{weatherStatus.rain_mm.toFixed(1)} <span className="text-[10px] font-normal">mm</span></span>
        </div>
        <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${weatherStatus.is_heat_alert ? 'bg-error text-on-error' : 'bg-surface-container-low text-on-surface'}`}>
          <span className="material-symbols-outlined mb-1 text-lg" style={{ fontVariationSettings: weatherStatus.is_heat_alert ? "'FILL' 1" : "'FILL' 0" }}>thermostat</span>
          <span className="font-headline font-semibold text-sm">{weatherStatus.temp_c.toFixed(1)} <span className="text-[10px] font-normal">°C</span></span>
        </div>
        <div className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${weatherStatus.is_aqi_alert ? 'bg-[#fde293] text-[#221b00]' : 'bg-surface-container-low text-on-surface'}`}>
          <span className="material-symbols-outlined mb-1 text-lg" style={{ fontVariationSettings: weatherStatus.is_aqi_alert ? "'FILL' 1" : "'FILL' 0" }}>air</span>
          <span className="font-headline font-semibold text-sm">{weatherStatus.aqi}</span>
        </div>
      </div>
    </div>
  );
}
