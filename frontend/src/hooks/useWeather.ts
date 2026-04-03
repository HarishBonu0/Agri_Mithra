import { useState, useEffect, useCallback } from "react";
import { weatherService } from "@/lib/weatherService";
import { WeatherResponse, LocationData } from "@/lib/weatherConfig";

export interface UseWeatherState {
  weather: WeatherResponse | null;
  loading: boolean;
  errorKey: string | null;
  location: LocationData | null;
  manualCity: string | null;
  riskLevel: "safe" | "caution" | "notSafe";
  riskIcon: string;
  riskReasonKey: string;
  adviceKeys: string[];
  conditionKey: string;
  isDayTime: "day" | "night";
  refreshing: boolean;
}

export function useWeather(): UseWeatherState & {
  refreshWeather: () => Promise<void>;
  setManualCity: (city: string) => void;
  clearError: () => void;
} {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualCity, setManualCity] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const riskData = weather
    ? weatherService.calculateRisk(weather)
    : { level: "safe" as const, icon: "🟢", reasonKey: "weather.loading" };

  const adviceKeys = weather ? weatherService.generateAdvice(weather) : [];

  const conditionKey =
    weather && weather.weather[0]
      ? weatherService.getWeatherCondition(
          weather.weather[0].description,
          weather.weather[0].icon,
          weather.main.temp
        )
      : "weather.loading";

  const isDayTime =
    weather && weather.sys
      ? weatherService.isDayNightFromIcon(weather.weather[0]?.icon || "d")
      : "day";

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setErrorKey(null);

    try {
      let weatherData: WeatherResponse | null = null;

      // If manual city is set, use that
      if (manualCity) {
        weatherData = await weatherService.fetchWeatherByCity(manualCity);
        if (weatherData) {
          setLocation({
            lat: weatherData.coord.lat,
            lon: weatherData.coord.lon,
            city: weatherData.name,
          });
        } else {
          setErrorKey("weather.invalidLocation");
        }
      } else {
        // Try to get geolocation
        const loc = await weatherService.getLocationWithPermission();

        if (loc) {
          setLocation(loc);
          weatherData = await weatherService.fetchWeather(loc);
        } else {
          setErrorKey("weather.geoPermissionDenied");
        }
      }

      if (weatherData) {
        setWeather(weatherData);
      } else if (!errorKey) {
        setErrorKey("weather.fetchError");
      }
    } catch (err) {
      setErrorKey("weather.fetchError");
    } finally {
      setLoading(false);
    }
  }, [manualCity, errorKey]);

  // Initial load on component mount
  useEffect(() => {
    loadWeather();
  }, []);

  const refreshWeather = useCallback(async () => {
    setRefreshing(true);
    weatherService.clearCache();
    await loadWeather();
    setRefreshing(false);
  }, [loadWeather]);

  const handleSetManualCity = useCallback((city: string) => {
    setManualCity(city);
    if (city.trim()) {
      // Trigger load immediately
      setTimeout(() => loadWeather(), 0);
    }
  }, [loadWeather]);

  const clearError = useCallback(() => {
    setErrorKey(null);
  }, []);

  return {
    weather,
    loading,
    errorKey,
    location,
    manualCity,
    riskLevel: riskData.level,
    riskIcon: riskData.icon,
    riskReasonKey: riskData.reasonKey,
    adviceKeys,
    conditionKey,
    isDayTime,
    refreshing,
    refreshWeather,
    setManualCity: handleSetManualCity,
    clearError,
  };
}
