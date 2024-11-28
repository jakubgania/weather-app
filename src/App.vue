<script setup lang="ts">
import iconsData from '../descriptions.json'

import { onMounted, ref, computed, watch, reactive } from 'vue'

import { useWeatherAPI } from './useWeatherAPI';
import { useGeoLocation } from './useGeoLocation';
import { useSearchLocation } from './useSearchLocation';

import SearchResultsList from './components/SearchResultsList.vue';
import LocationLabel from './components/LocationLabel.vue';
import GridDetails from './components/GridDetails.vue';
import HourlyForecast from './components/HourlyForecast.vue';
import DailyForecast from './components/DailyForecast.vue';

import {
  City,
  HourlyData,
  DailyData,
  WeatherIconData,
} from './types';

import {
  transformNumber,
  getDayName,
  formattedTime
} from './utils';

import { DEFAULT_COORDINATES } from './constants';

const { weatherAPIData, fetchAPI } = useWeatherAPI();
const { getBrowserCoordinates } = useGeoLocation();
const { getCoordinates } = useSearchLocation()

const viewType = ref<string>('details')
const searchResults  =ref<City[]>([]);
const searchBarValue = ref<string>('')
const currentLocationFlag = ref<boolean>(true)
const likedCities = ref<City[]>([]);

const currentCity = reactive<City>({
  cityName: '',
  latitude: 0,
  longitude: 0,
  country: '',
  countryCode: '',
  admin1: '',
})

const addCity = (): void => {
  if (!checkIfCityIsAdded(currentCity.cityName)) {
    likedCities.value.push({ ...currentCity });

    alert(`You have added ${currentCity.cityName} to your watch list ✅`)
  } else {
    alert('This city is already added ⚠️')
  }
}

const removeCity = (): void => {
  likedCities.value = likedCities.value.filter((item) => item.cityName !== currentCity.cityName);
}

const checkIfCityIsAdded = (city: string): boolean => likedCities.value.some((item) => item.cityName === city);

// combine the daily data arrays into one
const combinedDailyData = computed<DailyData[]>(() => {
  if (weatherAPIData.value && weatherAPIData.value.daily) {
    const {
      time,
      weather_code,
      temperature_2m_max,
      temperature_2m_min
    } = weatherAPIData.value.daily;
    
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
    const {
      time,
      weather_code,
      temperature_2m
    } = weatherAPIData.value.hourly;
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

const searchLocation = async (): Promise<void> => {
  const locationName = searchBarValue.value;
  const coordinates = await getCoordinates(locationName);
  
  if (coordinates) {
    searchResults.value = coordinates
  }

  return
}

const showDetailsView = async (city: City): Promise<void> => {
  viewType.value = "details"
  Object.assign(currentCity, city)
  
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
    // searchResults.value = likedCities.value.reverse()

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
    searchResults.value = [...likedCities.value].reverse()
  }
}

watch(searchBarValue, async () => {
  if (searchBarValue.value.length > 3) {
    await searchLocation()
  } else {
    searchResults.value = []
  }
})

const showDetailsForCurrentLocation = async (): Promise<void> => {
  const currentCoordinates = await getBrowserCoordinates();

  if (currentCoordinates) {
    currentLocationFlag.value = true
    viewType.value = "details"

    // thanks to this its possible add your current location to your favorites with the name 'your location'
    currentCity.cityName = "Your location"

    await fetchAPI(currentCoordinates.latitude, currentCoordinates.longitude)
  } else {
    viewType.value = "details"
    await loadInitData()
  }
}

const loadInitData = async (): Promise<void> => {
  const {
      initLatitude,
      initLongitude,
      initCityName,
      initCountry,
      initCountryCode,
      initAdmin1
    } = DEFAULT_COORDINATES;
    
    currentCity.cityName = initCityName;
    currentCity.latitude = initLatitude;
    currentCity.longitude = initLongitude;
    currentCity.country = initCountry;
    currentCity.countryCode = initCountryCode;
    currentCity.admin1 = initAdmin1;

    currentLocationFlag.value = false

    await fetchAPI(initLatitude, initLongitude)
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
    currentCity.cityName = "Your location";
    currentCity.latitude = currentCoordinates.latitude;
    currentCity.longitude = currentCoordinates.longitude;
    currentCity.country = '';
    currentCity.countryCode = '';
    currentCity.admin1 = '';

    await fetchAPI(currentCoordinates.latitude, currentCoordinates.longitude)
  } else {
    await loadInitData()
  }
})
</script>

<template>
  <div class="w-full max-w-[640px] p-4 my-10 md:my-14 lg:my-20 ml-auto mr-auto">
    <div class="flex items-center gap-4">
      <h1 class="font-bold pb-4 text-4xl md:text-5xl lg:text-[3.2rem]">Weather App</h1>
      <img src="../src/assets/windsock.gif" class="w-8 md:w-10 lg:w-12 -mt-2" />
    </div>
    <template v-if="viewType === 'search'">
      <div>
        <div>
          <div class="relative pt-8">
            <input
              type="search"
              v-model="searchBarValue"
              placeholder="Type city"
              autocomplete="off"
              :class="[
                'w-full',
                'py-3',
                'pl-4',
                'pr-12',
                'placeholder-slate-400',
                'font-semibold',
                'rounded-full',
                'border',
                'bg-transparent',
                'border-slate-200',
                'focus:outline-none',
              ]"
            />
            <img src="../src/assets/magnifier.png" class="absolute inset-y-3 right-1 w-9 pt-8 pr-3 my-auto" />
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
          <SearchResultsList
            :searchResults="searchResults"
            :onCitySelect="showDetailsView"
          />
        </div>
      </div>
    </template>
    <template v-if="viewType === 'details'">
      <div class="flex flex-col gap-8">
        <div class="flex justify-between text-lg md:text-xl pt-8">
          <div class="flex items-center gap-2">
            <img src="../src/assets/chevron-right.png" class="w-5 rotate-180 -ml-1" />
            <button
              @click="returnToSearchView()"
              class="text-blue-500"
            >
              Return to search
            </button>
          </div>
          <div class="flex items-center gap-2">
            <template v-if="!checkIfCityIsAdded(currentCity.cityName)">
              <button @click="addCity()">Save</button>
              <img src="../src/assets/add.png" class="w-5" />
            </template>
            <template v-if="checkIfCityIsAdded(currentCity.cityName)">
              <button @click="removeCity()">Remove</button>
              <img src="../src/assets/minus.png" class="w-5" />
            </template>
          </div>
        </div>
        <LocationLabel
          :currentCity="currentCity"
          :wheaterData="weatherAPIData"
          :currentLocationFlag="currentLocationFlag"
          :transformNumber="transformNumber"
          :getWeatherDetails="getWeatherDetails"
        />
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
</template>

<!-- <style scoped>
</style> -->
