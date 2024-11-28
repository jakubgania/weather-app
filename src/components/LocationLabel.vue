<script setup lang="ts">
import { defineProps } from 'vue';
import { City, WeatherApiResponse } from '../types';

defineProps<{
  currentCity: City;
  wheaterData: WeatherApiResponse | null;
  currentLocationFlag: boolean;
  transformNumber: (temperature: number) => number;
  getWeatherDetails: (weatherCode: string, checkDay: boolean) => { image: string; description: string } | null;
}>();
</script>

<template>
  <div class="flex items-center gap-4 md:gap-6 lg:gap-8">
    <div class="flex items-center">
      <span class="text-5xl md:text-6xl font-bold">{{ wheaterData ? transformNumber(wheaterData?.current.temperature_2m) : "n/a" }}&deg;</span>
      <img
        v-if="wheaterData?.current.weather_code"
        :src="getWeatherDetails(String(wheaterData?.current.weather_code), true)?.image"
        :alt="getWeatherDetails(String(wheaterData?.current.weather_code), true)?.description"
        class="w-16 md:w-20 lg:w-24"
      />
    </div>
    <div>
      <div>
        <div class="flex items-center">
          <span class="text-2xl md:text-3xl font-semibold">
            {{ currentCity.cityName }}
          </span>
        </div>
      </div>
      <p v-if="currentLocationFlag" class="text-sm text-gray-400">
        Data for your current location: lat. {{ currentCity.latitude.toFixed(2) }} - lng. {{ currentCity.longitude.toFixed(2) }}
      </p>
      <p v-else class="text-sm text-gray-400">
        <template v-if="currentCity.country">
          {{ `${currentCity.country} - ${currentCity.admin1} | ${currentCity.countryCode}` }}
        </template>
        <template v-else>
          {{ `${currentCity.admin1} | ${currentCity.countryCode}` }}
        </template>
      </p>
    </div>
  </div>
</template>