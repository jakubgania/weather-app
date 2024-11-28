<script setup lang="ts">
import { defineProps } from 'vue';
import { HourlyData } from '../types';

defineProps<{
  hourlyData: HourlyData[];
  getWeatherDetails: (weatherCode: string, checkDay: boolean) => { image: string; description: string } | null;
}>();
</script>

<template>
  <div>
    <p class="text-sm font-medium text-gray-400 pb-2">HOURLY FORECAST</p>
    <div class="overflow-x-auto flex gap-4 pb-8">
      <div
        v-for="(item, index) in hourlyData.slice(0, 24)"
        :key="index"
        class="flex-shrink-0 bg-slate-50 rounded-xl aspect-square w-28"
      >
        <div class="flex flex-col space-y-0">
          <div class="flex justify-center pt-1">
            <span class="medium text-slate-400">{{ index == 0 ? "now" : item.time }}</span>
          </div>
          <div class="flex justify-center">
            <img
              :src="getWeatherDetails(String(item.weather_code), true)?.image"
              :alt="getWeatherDetails(String(item.weather_code), true)?.description"
              class="w-16 contrast-50"
            />
          </div>
          <div class="flex justify-center pb-1">
            <span class="font-medium">{{ item.temperature_2m }}&deg;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>