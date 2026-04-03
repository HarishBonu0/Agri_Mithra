import {
  WEATHER_CONFIG,
  WeatherResponse,
  CachedWeather,
  LocationData,
} from "@/lib/weatherConfig";

class WeatherService {
  /**
   * Request location permission and get coordinates
   */
  async getLocationWithPermission(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lon: longitude };
          
          // Save to localStorage so we don't ask again
          localStorage.setItem(
            WEATHER_CONFIG.PERMISSION_KEY,
            JSON.stringify(location)
          );
          
          resolve(location);
        },
        (error) => {
          console.warn("Location permission denied or unavailable:", error);
          // Check if we have a previously saved location
          const saved = localStorage.getItem(WEATHER_CONFIG.PERMISSION_KEY);
          if (saved) {
            try {
              resolve(JSON.parse(saved));
            } catch {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Fetch weather data with caching
   */
  async fetchWeather(
    location: LocationData
  ): Promise<WeatherResponse | null> {
    try {
      // Check cache first
      const cached = this.getFromCache();
      if (cached) {
        return cached.data;
      }

      const url = `${WEATHER_CONFIG.BASE_URL}?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_CONFIG.API_KEY}&units=metric`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherResponse = await response.json();

      // Cache the result
      this.saveToCache(data);

      return data;
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      return null;
    }
  }

  /**
   * Get weather by city name as fallback
   */
  async fetchWeatherByCity(
    city: string
  ): Promise<WeatherResponse | null> {
    try {
      const url = `${WEATHER_CONFIG.BASE_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_CONFIG.API_KEY}&units=metric`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherResponse = await response.json();
      this.saveToCache(data);
      
      return data;
    } catch (error) {
      console.error("Failed to fetch weather by city:", error);
      return null;
    }
  }

  /**
   * Check if it's night based on sunset time
   */
  isNight(sunrise: number, sunset: number, currentTime: number): boolean {
    return currentTime < sunrise || currentTime > sunset;
  }

  /**
   * Determine if it's day or night using icon
   */
  isDayNightFromIcon(icon: string): "day" | "night" {
    return icon.includes("n") ? "night" : "day";
  }

  /**
   * Get human-readable weather condition with day/night awareness
   */
  getWeatherCondition(
    description: string,
    icon: string,
    temp: number
  ): string {
    const isDayTime = this.isDayNightFromIcon(icon);
    const desc = description.toLowerCase();

    if (desc.includes("clear")) {
      return isDayTime === "night" ? "weather.clearweatherNight" : "weather.clearweather";
    }
    if (desc.includes("cloud")) {
      return isDayTime === "night" ? "weather.cloudyNight" : "weather.cloudy";
    }
    if (desc.includes("rain")) {
      return isDayTime === "night" ? "weather.rainyNight" : "weather.rainy";
    }
    if (desc.includes("snow")) {
      return "weather.snowy";
    }
    if (desc.includes("thunderstorm")) {
      return "weather.thunderstorm";
    }
    if (desc.includes("mist") || desc.includes("fog")) {
      return isDayTime === "night" ? "weather.mistyNight" : "weather.misty";
    }

    return "weather.conditionUnknown";
  }

  /**
   * Calculate risk level based on weather conditions
   */
  calculateRisk(weather: WeatherResponse): {
    level: "safe" | "caution" | "notSafe";
    icon: string;
    reasonKey: string;
  } {
    const { main, wind, weather: weatherArray, sys, dt } = weather;
    const now = Math.floor(Date.now() / 1000);
    const isNightTime = this.isNight(sys.sunrise, sys.sunset, now);

    // Night time is not safe
    if (isNightTime) {
      return {
        level: "notSafe",
        icon: "🌙",
        reasonKey: "weatherRisk.night",
      };
    }

    // Rain > 60%
    const rainProbability =
      weatherArray.some((w) => w.main === "Rain" || w.main === "Thunderstorm") 
        ? 80 
        : 0;
    
    if (rainProbability > 60) {
      return {
        level: "notSafe",
        icon: "🔴",
        reasonKey: "weatherRisk.rain",
      };
    }

    // Check multiple caution conditions
    const cautionReasons: string[] = [];

    if (main.temp > 35) {
      cautionReasons.push("weatherRisk.highTemp");
    }

    if (main.humidity > 80) {
      cautionReasons.push("weatherRisk.highHumidity");
    }

    if (wind.speed > 20) {
      cautionReasons.push("weatherRisk.strongWinds");
    }

    if (cautionReasons.length > 0) {
      return {
        level: "caution",
        icon: "🟡",
        reasonKey: cautionReasons.join("|"),
      };
    }

    // All conditions good
    return {
      level: "safe",
      icon: "🟢",
      reasonKey: "weatherRisk.optimal",
    };
  }

  /**
   * Generate farmer-friendly advice based on weather
   */
  generateAdvice(weather: WeatherResponse): string[] {
    const { main, wind, weather: weatherArray, sys, dt } = weather;
    const now = Math.floor(Date.now() / 1000);
    const isNightTime = this.isNight(sys.sunrise, sys.sunset, now);

    const advice: string[] = [];

    // Night advice
    if (isNightTime) {
      advice.push("weatherAdvice.rest");
      return advice;
    }

    // Rain advice
    const hasRain = weatherArray.some(
      (w) => w.main === "Rain" || w.main === "Thunderstorm"
    );
    if (hasRain) {
      advice.push("weatherAdvice.rain");
    }

    // Wind advice
    if (wind.speed > 20) {
      advice.push("weatherAdvice.windStrong");
    } else if (wind.speed < 5) {
      advice.push("weatherAdvice.windCalm");
    }

    // Humidity advice
    if (main.humidity > 80) {
      advice.push("weatherAdvice.humidityHigh");
    } else if (main.humidity < 40) {
      advice.push("weatherAdvice.humidityLow");
    }

    // Temperature advice
    if (main.temp > 35) {
      advice.push("weatherAdvice.tempHigh");
    } else if (main.temp < 15) {
      advice.push("weatherAdvice.tempLow");
    } else {
      advice.push("weatherAdvice.tempGood");
    }

    // General good conditions
    if (
      !hasRain &&
      wind.speed <= 20 &&
      main.humidity <= 80 &&
      main.temp <= 35 &&
      main.temp >= 15
    ) {
      advice.push("weatherAdvice.good");
    }

    return advice;
  }

  /**
   * Cache management
   */
  private saveToCache(data: WeatherResponse): void {
    const cached: CachedWeather = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem("agrimitra-weather-cache", JSON.stringify(cached));
  }

  private getFromCache(): CachedWeather | null {
    try {
      const cached = localStorage.getItem("agrimitra-weather-cache");
      if (!cached) return null;

      const parsed: CachedWeather = JSON.parse(cached);
      const isExpired =
        Date.now() - parsed.timestamp > WEATHER_CONFIG.CACHE_DURATION;

      if (isExpired) {
        localStorage.removeItem("agrimitra-weather-cache");
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  clearCache(): void {
    localStorage.removeItem("agrimitra-weather-cache");
    localStorage.removeItem(WEATHER_CONFIG.PERMISSION_KEY);
  }
}

export const weatherService = new WeatherService();
