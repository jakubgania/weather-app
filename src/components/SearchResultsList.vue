<script setup lang="ts">
import { defineProps } from 'vue';
import { City } from '../types';
import { formatLabelDescription } from '../utils';

defineProps<{
  searchResults: City[];
  onCitySelect: (city: City) => void;
}>();
</script>

<template>
  <ul class="pt-6">
    <li
      v-for="(city, index) in searchResults"
      :key="index"
      class="bg-slate-50 rounded-xl w-full mb-2 group"
    >
      <div @click="onCitySelect(city)" class="flex items-center justify-between py-3 cursor-default hover:bg-slate-100 hover:rounded-xl">
        <div class="pl-2 leading-3">
          <div>
            <span class="text-lg font-semibold md:group-hover:pl-1 delay-75 ease-in duration-100">{{ city.cityName }}</span>
          </div>
          <div>
            <span class="text-sm font-medium md:group-hover:pl-1 delay-150 ease-in duration-100">{{ formatLabelDescription(city) }}</span>
          </div>
        </div>
        <div>
          <img src="../../src/assets/chevron-right.png" class="w-6 pr-2" />
        </div>
      </div>
    </li>
  </ul>
</template>