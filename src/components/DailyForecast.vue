<script setup lang="ts">
import { defineProps } from 'vue';
import { DailyData } from '../types';

defineProps<{
  dailyData: DailyData[];
  getDayName: (isoDate: string) => string;
  getWeatherDetails: (weatherCode: string, checkDay: boolean) => { image: string; description: string } | null;
}>();
</script>

<template>
  <div>
    <p class="text-sm font-medium text-gray-400 pb-2">
      DAILY FORECAST
    </p>
    <ul>
      <li 
        v-for="(day, index) in dailyData"
        :key="index"
        class="border-b border-gray-100 last:border-b-0"
      >
        <div class="flex items-center py-3 text-xl md:text-2xl">
          <div class="basis-2/6 md:basis-1/4">
            <span class="hidden md:block font-medium">{{ getDayName(day.time) }}</span>
            <span class="block md:hidden font-medium">{{ getDayName(day.time).slice(0, 3) }}</span> 
          </div>
          <div class="basis-2/6 md:basis-1/4">
            <img
              :src="getWeatherDetails(String(day.weather_code), false)?.image"
              :alt="getWeatherDetails(String(day.weather_code), false)?.description"
              class="w-14 md:w-16"
            />
          </div>
          <div class="basis-4/6 md:basis-2/4 flex justify-end">
            <div class="flex justify-between w-full max-w-40 md:max-w-56 pl-4 pr-4 md:pr-8">
              <div>
                <span class="text-slate-400 font-medium tracking-wide">{{ day.temperature_2m_min }}°C</span>
              </div>
              <div>
                <span class="pl-8 font-medium tracking-wide">{{ day.temperature_2m_max }}°C</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>