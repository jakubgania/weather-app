<script setup lang="ts">
import iconsData from '../descriptions.json'

import { onMounted, ref, computed, watch } from 'vue'

import { useWeatherAPI } from './useWeatherAPI';
import { useGeoLocation } from './useGeoLocation';
import { useSearchLocation } from './useSearchLocation';

import GridDetails from './components/GridDetails.vue';
import HourlyForecast from './components/HourlyForecast.vue';
import DailyForecast from './components/DailyForecast.vue';

import {
  City,
  HourlyData,
  DailyData,
  WeatherIconData,
} from './types';

const { weatherAPIData, fetchAPI } = useWeatherAPI();
const { getBrowserCoordinates } = useGeoLocation();
const { getCoordinates } = useSearchLocation()

const viewType = ref<string>('details')
const searchResults  =ref<City[]>([]);
const searchBarValue = ref<string>('')
const currentLocationFlag = ref<boolean>(true)
const likedCities = ref<City[]>([]);
const cityName = ref<string>('')
const latitude = ref<number>(0)
const longitude = ref<number>(0)
const country = ref<string>('')
const countryCode = ref<string>('')
const admin1 = ref<string>('')

const DEFAULT_COORDINATES = {
  initLatitude: 51.5142,
  initLongitude: 7.4684,
  initCityName: 'Dortmund',
  initCountry: 'Germany',
  initCountryCode: 'DE',
  initAdmin1: 'North Rhine-Westphalia'
};

const addCity = (): void => {
  if (!likedCities.value.some((item) => item.cityName === cityName.value)) {
    likedCities.value.push({
      latitude: latitude.value,
      longitude: longitude.value,
      cityName: cityName.value,
      country: country.value,
      countryCode: countryCode.value,
      admin1: admin1.value
    });

    alert(`You have added ${cityName.value} to your watch list ✅`)
  } else {
    alert('This city is already added ⚠️')
  }
}

const removeCity = (): void => {
  likedCities.value = likedCities.value.filter((item) => item.cityName !== cityName.value);
}

const checkIfCityIsAdded = (city: string): boolean => likedCities.value.some((item) => item.cityName === city);

// rounding the temperature to one digit
const transformNumber = (temperature: number) => {
  return Math.round(Number(temperature))
}

// combine the daily data arrays into one
const combinedDailyData = computed<DailyData[]>(() => {
  if (weatherAPIData.value && weatherAPIData.value.daily) {
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = weatherAPIData.value.daily;
    
    return time.map((t, index) => ({
      time: t,
      weather_code: weather_code[index],
      temperature_2m_max: transformNumber(temperature_2m_max[index]),
      temperature_2m_min: transformNumber(temperature_2m_min[index]),
    }));
  }

  return [];
});

// combine the daily data arrays into one
const combinedHourlyData = computed<HourlyData[]>(() => {
  if (weatherAPIData.value && weatherAPIData.value.daily) {
    const { time, weather_code, temperature_2m } = weatherAPIData.value.hourly;
    const currentHour = new Date().getHours();
    const formatHour = (hour: number) => (hour < 10 ? `0${hour}` : `${hour}`);
    let counter = 0

    return time.map((t, index) => {
      const hour = new Date(t).getHours();

      return {
        time: formatHour(hour),
        weather_code: weather_code[index],
        temperature_2m: transformNumber(temperature_2m[index]),
      }
    })
    .filter(item => {
      if (parseInt(item.time) <= 23 && counter < 1) {
        if (parseInt(item.time) == 23) {
          counter = 1
        }

        return parseInt(item.time) >= currentHour
      }

      if (counter == 1) {
        return parseInt(item.time)
      }
    });
  }

  return [];
});


const getDayName = (isoDate: string): string => {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

const searchLocation = async (): Promise<void> => {
  const locationName = searchBarValue.value;
  const coordinates = await getCoordinates(locationName);
  
  if (coordinates) {
    searchResults.value = coordinates
  }

  return
}

const formattedTime = (originalTime: string): string => {
  const dateObj = new Date(originalTime);

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return formattedTime;
}

const showDetailsView = async (city: City): Promise<void> => {
  viewType.value = "details"
  cityName.value = city.cityName
  latitude.value = city.latitude
  longitude.value = city.longitude
  country.value = city.country
  countryCode.value = city.countryCode
  admin1.value = city.admin1

  currentLocationFlag.value = false

  await fetchAPI(city.latitude, city.longitude)
}

const returnToSearchView = (): void => {
  viewType.value = "search"
}

const showSavedCities = (): void => {
  if (likedCities.value.length == 0) {
    alert("You haven't added any city yet")
  } else {
    searchResults.value = likedCities.value.reverse()
  }
}

watch(searchBarValue, async () => {
  if (searchBarValue.value.length > 3) {
    await searchLocation()
  } else {
    searchResults.value = []
  }
})

const showDetailsForCurrentLocation = async () => {
  const currentCoordinates = await getBrowserCoordinates();
  if (currentCoordinates) {
    currentLocationFlag.value = true
    viewType.value = "details"

    // thanks to this its possible add your current location to your favorites with the name 'your location'
    cityName.value = "Your location"

    await fetchAPI(currentCoordinates.latitude, currentCoordinates.longitude)
  }
}

const getWeatherDetails = (weatherCode: string, checkDay: boolean) => {
  if (checkDay) {
    const isDay = weatherAPIData.value?.current.is_day;
    const key = isDay ? 'day' : 'night';

    return (iconsData as Record<string, WeatherIconData>)[weatherCode]?.[key] || null;
  } else {
    return (iconsData as Record<string, WeatherIconData>)[weatherCode]?.day || null;
  }
}

onMounted( async () => {
  const currentCoordinates = await getBrowserCoordinates();

  if (currentCoordinates) {
    cityName.value = "Your location"
    latitude.value = currentCoordinates.latitude
    longitude.value = currentCoordinates.longitude
    country.value = ''
    countryCode.value = ''
    admin1.value = ''

    await fetchAPI(currentCoordinates.latitude, currentCoordinates.longitude)
  } else {
    const {
      initLatitude,
      initLongitude,
      initCityName,
      initCountry,
      initCountryCode,
      initAdmin1
    } = DEFAULT_COORDINATES;
    
    cityName.value = initCityName
    latitude.value = initLatitude
    longitude.value = initLongitude
    country.value = initCountry
    countryCode.value = initCountryCode
    admin1.value = initAdmin1

    await fetchAPI(initLatitude, initLongitude)
  }
})
</script>

<template>
  <div class="w-[640px] p-4 my-20">
    <div class="flex items-center gap-4">
      <h1 class="font-bold pb-4 text-[3.2rem]">Weather App</h1>
      <img src="../src/assets/windsock.gif" class="w-12 -mt-2" />
    </div>
    <template v-if="viewType === 'search'">
      <div>
        <div>
          <div class="relative pt-8">
            <input
              type="search"
              v-model="searchBarValue"p
              laceholder="Type city"
              autocomplete="off"
              :class="[
                'w-full',
                'p-3',
                'pr-12',
                'placeholder-slate-400',
                'font-semibold',
                'rounded-xl',
                'border',
                'border-slate-100',
                'focus:outline-none',
              ]"
            />
            <img src="../src/assets/magnifier.png" class="absolute inset-y-3 right-0 w-9 pt-8 pr-3 my-auto" />
          </div>
        </div>
        <div class="mt-3">
          <div class="flex gap-2 text-sm">
            <div>
              <button
                @click="showSavedCities()"
                class="p-2 font-bold rounded-xl bg-slate-50"
              >
                Show saved
              </button>
            </div>
            <div>
              <button
                @click="showDetailsForCurrentLocation()"
                class="p-2 font-bold rounded-xl bg-slate-50"
              >
                Use my location
              </button>
            </div>
          </div>
        </div>
        <div>
          <ul class="pt-6">
            <li
              v-for="(city, index) in searchResults"
              :key="index"
              class="bg-slate-50 rounded-xl w-full mb-2"
            >
              <div @click="showDetailsView(city)" class="flex items-center justify-between py-3 cursor-default hover:bg-slate-100 hover:rounded-xl">
                <div class="pl-2">
                  <div>
                    <span class="font-semibold">{{ city.cityName }}</span>
                  </div>
                  <div>
                    <span class="text-sm font-medium">{{ `${city.country} - ${city.admin1} | ${city.countryCode}` }}</span>
                  </div>
                </div>
                <div>
                  <img src="../src/assets/chevron-right.png" class="w-6 pr-2" />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>
    <template v-if="viewType === 'details'">
      <div class="flex flex-col gap-8">
        <div class="flex justify-between text-xl pt-8">
          <div class="flex items-center gap-2">
            <img src="../src/assets/chevron-right.png" class="w-5 rotate-180" />
            <button @click="returnToSearchView()" class="text-blue-500">Return to search</button>
          </div>
          <div class="flex items-center gap-2">
            <template v-if="!checkIfCityIsAdded(cityName)">
              <button @click="addCity()">Save</button>
              <img src="../src/assets/add.png" class="w-5" />
            </template>
            <template v-if="checkIfCityIsAdded(cityName)">
              <button @click="removeCity()">Remove</button>
              <img src="../src/assets/minus.png" class="w-5" />
            </template>
          </div>
        </div>
        <div>
          <div>
            <div class="flex items-center">
              <span class="text-4xl font-semibold">
                {{ cityName }}:
                {{ weatherAPIData ? transformNumber(weatherAPIData?.current.temperature_2m) : "n/a" }}&deg;
              </span>
              <img
                v-if="weatherAPIData?.current.weather_code"
                :src="getWeatherDetails(String(weatherAPIData?.current.weather_code), true).image"
                :alt="getWeatherDetails(String(weatherAPIData?.current.weather_code), true).description"
                class="w-16"
              />
            </div>
          </div>
          <p v-if="currentLocationFlag" class="text-sm text-gray-400">
            Data for your current location
          </p>
          <p v-else class="text-sm text-gray-400">
            {{ `${country} - ${admin1} | ${countryCode}` }}
          </p>
        </div>
        <GridDetails
          :weatherData="weatherAPIData"
          :formattedTime="formattedTime"
        />
        <HourlyForecast
          :hourlyData="combinedHourlyData"
          :getWeatherDetails="getWeatherDetails"
        />
        <DailyForecast
          :dailyData="combinedDailyData"
          :getDayName="getDayName"
          :getWeatherDetails="getWeatherDetails"
        />
      </div>
    </template>
  </div>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<!-- <style scoped>
</style> -->
