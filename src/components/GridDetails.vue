<script setup lang="ts">
import { defineProps } from 'vue';
import { WeatherApiResponse } from '../types';

defineProps<{
  weatherData: WeatherApiResponse | null;
  formattedTime: (originalTime: string) => string;
}>();
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-lg p-2 md:p-4 bg-slate-50">
        <div class="pb-2">
          <h3 class="tracking-wide text-lg md:text-xl text-slate-400">Sunrise</h3>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
          <img src="../../src/assets/sunrise.png" alt="Sunrise icon" class="w-7 md:w-8" />
          <span class="text-2xl md:text-3xl lg:text-4xl">{{ formattedTime(weatherData ? weatherData?.daily.sunrise[0] : "n/a") }}</span>
        </div>
        </div>
        <div class="rounded-lg p-2 md:p-4 bg-slate-50">
          <div class="pb-2">
          <h3 class="tracking-wide text-lg md:text-xl text-slate-400">Sunset</h3>
        </div>
        <div class="flex items-center gap-4">
          <img src="../../src/assets/sunset.png" alt="Sunset icon" class="w-7 md:w-8" />
          <span class="text-2xl md:text-3xl lg:text-4xl">{{ formattedTime(weatherData ? weatherData?.daily.sunset[0] : "n/a") }}</span>
        </div>
        </div>
        <div class="rounded-lg p-2 md:p-4 bg-slate-50">
          <div class="pb-2">
          <h3 class="tracking-wide text-lg md:text-xl text-slate-400">Wind speed</h3>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
          <img src="../../src/assets/wind.png" alt="Wind icon" class="w-7 md:w-8" />
          <span class="text-2xl md:text-3xl lg:text-4xl">{{ weatherData ? weatherData?.current.wind_speed_10m + " km/h" : "n/a" }}</span>
        </div>
      </div>
      <div class="rounded-lg p-2 md:p-4 bg-slate-50">
        <div class="pb-2">
          <h3 class="tracking-wide text-lg md:text-xl text-slate-400">Humidity</h3>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
          <img src="../../src/assets/humidity.png" alt="Humidity icon" class="w-7 md:w-8" />
          <span class="text-2xl md:text-3xl lg:text-4xl">{{ weatherData ? weatherData?.current.relative_humidity_2m + " %" : "n/a" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>