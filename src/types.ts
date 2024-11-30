
export interface Units {
  time: string;
  temperature_2m: string;
  weather_code: string;
}

export interface CurrentUnits extends Units {
  interval: string;
  relative_humidity_2m: string;
  is_day: string;
  wind_speed_10m: string;
}

export interface HourlyUnits extends Units {}

export interface DailyUnits extends Units {
  temperature_2m_max: string;
  temperature_2m_min: string;
  sunrise: string;
  sunset: string;
}

export interface CurrentWeather {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[]
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: CurrentUnits;
  current: CurrentWeather;
  hourly_units: HourlyUnits;
  hourly: HourlyWeather;
  daily_units: DailyUnits;
  daily: DailyWeather;
};

// city details
export interface City {
  latitude: number;
  longitude: number;
  cityName: string;
  country: string;
  countryCode: string;
  admin1: string;
}

export type DailyData = {
  time: string;
  weather_code: string | number;
  temperature_2m_max: number;
  temperature_2m_min: number;
};

export type HourlyData = {
  time: string,
  weather_code: string | number;
  temperature_2m: number
}

// weather icon details
export type WeatherIconData = {
  day: {
    description: string;
    image: string;
  };
  night: {
    description: string;
    image: string;
  };
};

export interface GeocodingApiResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
    country_code: string;
    admin1: string;
  }[];
};
