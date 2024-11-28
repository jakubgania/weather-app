import { ref } from 'vue';
import { WeatherApiResponse } from './types'

export function useWeatherAPI() {
    const weatherAPIData = ref<WeatherApiResponse | null>(null);

    const fetchAPI = async (latitude: number, longitude: number): Promise<void> => {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,is_day,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=Europe%2FBerlin`)
            const data = await response.json()
            weatherAPIData.value = data
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    return {
        weatherAPIData,
        fetchAPI,
    };
}