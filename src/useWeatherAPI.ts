import { ref } from 'vue';
import { WeatherApiResponse } from './types'
import { API_FORECAST_ENDPOINT } from './constants';

export function useWeatherAPI() {
  const weatherAPIData = ref<WeatherApiResponse | null>(null);

  const fetchAPI = async (latitude: number, longitude: number): Promise<void> => {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'wind_speed_10m',
        'is_day',
        'weather_code'
      ].join(','),
      hourly: [
        'temperature_2m',
        'weather_code'
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset'
      ].join(','),
      forecast_days: String(5),
      timezone: 'Europe/Berlin'
    })

    try {
      const response = await fetch(API_FORECAST_ENDPOINT + '?' + params.toString())

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }
            
      const data = await response.json()
      weatherAPIData.value = data
    } catch (error) {
      console.error("Error in fetchAPI:", error);
      throw error
    }
  };

  return {
    weatherAPIData,
    fetchAPI,
  };
}