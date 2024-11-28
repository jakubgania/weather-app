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
      <div class="rounded-lg p-4 bg-slate-50">
        <div class="pb-2">
          <h3 class="tracking-wide text-xl text-slate-400">Sunrise</h3>
        </div>
        <div class="flex items-center gap-4">
          <img src="../../src/assets/sunrise.png" class="w-8" />
          <span class="text-4xl">{{ formattedTime(weatherData ? weatherData?.daily.sunrise[0] : "n/a") }}</span>
        </div>
        </div>
        <div class="rounded-lg p-4 bg-slate-50">
          <div class="pb-2">
          <h3 class="tracking-wide text-xl text-slate-400">Sunset</h3>
        </div>
        <div class="flex items-center gap-4">
          <img src="../../src/assets/sunset.png" class="w-8" />
          <span class="text-4xl">{{ formattedTime(weatherData ? weatherData?.daily.sunset[0] : "n/a") }}</span>
        </div>
        </div>
        <div class="rounded-lg p-4 bg-slate-50">
          <div class="pb-2">
          <h3 class="tracking-wide text-xl text-slate-400">Wind speed</h3>
        </div>
        <div class="flex items-center gap-4">
          <img src="../../src/assets/wind.png" class="w-8" />
          <span class="text-4xl">{{ weatherData ? weatherData?.current.wind_speed_10m + " km/h" : "n/a" }}</span>
        </div>
      </div>
      <div class="rounded-lg p-4 bg-slate-50">
        <div class="pb-2">
          <h3 class="tracking-wide text-xl text-slate-400">Humidity</h3>
        </div>
        <div class="flex items-center gap-4">
          <img src="../../src/assets/humidity.png" class="w-8" />
          <span class="text-4xl">{{ weatherData ? weatherData?.current.relative_humidity_2m + " %" : "n/a" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>