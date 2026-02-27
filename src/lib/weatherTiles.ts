/**
 * OpenWeatherMap tile layers for weather overlay.
 * Requires VITE_OWM_API_KEY in environment.
 */

export interface WeatherLayer {
  id: string;
  label: string;
  urlTemplate: string;
}

const API_KEY = import.meta.env.VITE_OWM_API_KEY || '';

export const WEATHER_LAYERS: WeatherLayer[] = [
  { id: 'temp', label: 'Temperatur', urlTemplate: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
  { id: 'precipitation', label: 'Niederschlag', urlTemplate: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
  { id: 'wind', label: 'Wind', urlTemplate: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
  { id: 'clouds', label: 'Wolken', urlTemplate: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
  { id: 'pressure', label: 'Luftdruck', urlTemplate: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${API_KEY}` },
];

export function hasWeatherApiKey(): boolean {
  return API_KEY.length > 0;
}
