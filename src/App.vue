<script setup lang="ts">
import iconsData from '../descriptions.json'
import { onMounted, ref, computed, watch } from 'vue'

interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    is_day: string;
    weather_code: string;
    wind_speed_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    weather_code: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];   
    sunrise: string[];
    sunset: string[];
  };
}

interface City {
  latitude: number;
  longitude: number;
  cityName: string;
}

const viewType = ref<string>('details')
const searchResults  =ref<City[]>([]);
const searchBarValue = ref<string>('')
const currentLocationFlag = ref<boolean>(true)
const likedCities = ref<City[]>([]);
const cityName = ref<string>('')
const latitude = ref<number>(0)
const longitude = ref<number>(0)
const weatherAPIData = ref<WeatherApiResponse | null>(null);

const DEFAULT_COORDINATES = {
  initLatitude: 51.5142,
  initLongitude: 7.4684,
  initCityName: 'Dortmund'
};

const addCity = () => {
  if (!likedCities.value.some((item) => item.cityName === cityName.value)) {
    likedCities.value.push({
      latitude: latitude.value,
      longitude: longitude.value,
      cityName: cityName.value,
    });

    alert(`You have added ${cityName.value} to your watch list ✅`)
  } else {
    alert('This city is already added ⚠️')
  }
}

const removeCity = () => {
  likedCities.value = likedCities.value.filter((item) => item.cityName !== cityName.value);
}

const checkIfCityIsAdded = (city: string): boolean => {
  if (likedCities.value.some((item) => item.cityName === city)) {
    return true
  }

  return false
}

// rounding the temperature to one digit
const transformNumber = (temperature: number) => {
  return Math.round(Number(temperature))
}

// combine the daily data arrays into one
const combinedDailyData = computed(() => {
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
const combinedHourlyData = computed(() => {
  if (weatherAPIData.value && weatherAPIData.value.daily) {
    const { time, weather_code, temperature_2m } = weatherAPIData.value.hourly;

    const currentHour = new Date().getHours();
    let counter = 0
    
    const formatHour = (hour: number) => (hour < 10 ? `0${hour}` : `${hour}`);

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

// function showPosition() {

// }

const getBrowserCoordinates = async (): Promise<{ latitude: number; longitude: number } | null> => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return null;
  }

  // console.log(navigator.geolocation.getCurrentPosition(showPosition))

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location.');
        reject(null);
      }
    )
  })
}

const getCoordinates =  async (locationName: string): Promise<City[] | null> => {
  if (!locationName) {
    alert('Search bar is empty!');
    return null
  }

  const numberOfItems = 8

  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locationName}&count=${numberOfItems}&language=en&format=json`)
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const results = data.results.map((result: any) => ({
        latitude: result.latitude,
        longitude: result.longitude,
        cityName: result.name,
      }))

      return results;
    } else {
      alert('Location not found!');
      return null
    } 
  } catch(error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

const fetchAPI = async (latitude: number, longitude: number): Promise<void> => {
  await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,is_day,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=Europe%2FBerlin`)
  .then(async(response) => {
    const data: WeatherApiResponse = await response.json()
    console.log(data)
    weatherAPIData.value = data
  })
}

const searchLocation = async (): Promise<void> => {
  const locationName = searchBarValue.value;
  const coordinates = await getCoordinates(locationName);
  
  if (coordinates) {
    searchResults.value = coordinates
  }

  // const { latitude, longitude, cityName: fetchedCityName } = coordinates ?? DEFAULT_COORDINATES;
  // cityName.value = fetchedCityName
  // await fetchAPI(latitude, longitude);
  return
}

const formattedTime = (originalTime: string) => {
  const dateObj = new Date(originalTime);

  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return formattedTime;
}

const showDetailsView = async (latitudeVal: number, longitudeVal: number, city: string): Promise<void> => {
  viewType.value = "details"
  cityName.value = city
  latitude.value = latitudeVal
  longitude.value = longitudeVal
  currentLocationFlag.value = false

  await fetchAPI(latitudeVal, longitudeVal)
}

const returnToSearchView = () => {
  viewType.value = "search"
}

const showSavedCities = () => {
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

type WeatherIconData = {
  day: { description: string; image: string };
  night: { description: string; image: string };
};

const getWeatherDetails = (weatherCode: string, checkDay: boolean) => {
  // console.log(weatherAPIData.value?.current.is_day)
  
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

    await fetchAPI(currentCoordinates.latitude, currentCoordinates.longitude)
  } else {
    const { initLatitude, initLongitude, initCityName } = DEFAULT_COORDINATES;
    cityName.value = initCityName
    latitude.value = initLatitude
    longitude.value = initLongitude

    await fetchAPI(initLatitude, initLongitude)
  }
})
</script>

<template>
  <div class="w-[640px] p-4 mt-20">
    <div class="flex items-center gap-4">
      <h1 class="font-bold pb-4">Weather App</h1>
      <img src="../src/assets/windsock.gif" class="w-12 -mt-2" />
    </div>
    <Transition name="fade">
    <div v-if="viewType === 'search'">
      <div>
        <div class="relative">
          <input type="text" v-model="searchBarValue" placeholder="Type city" class="w-full p-3 pr-12 placeholder-slate-400 font-semibold rounded-xl bg-slate-50 focus:outline-none" />
          <img src="../src/assets/magnifier.png" class="absolute inset-y-3 right-0 w-9 pr-3 my-auto" />
        </div>
      </div>
      <div class="mt-2">
        <div class="flex gap-2 text-sm">
          <div>
            <button @click="showSavedCities()" class="p-2 font-bold rounded-xl bg-sky-50">Show saved</button>
          </div>
          <div>
            <button @click="showDetailsForCurrentLocation()" class="p-2 font-bold rounded-xl bg-sky-50">Use my location</button>
          </div>
        </div>
      </div>
      <div>
        <ul class="pt-6">
          <li v-for="(city, index) in searchResults" :key="index" class="bg-slate-50 rounded-xl w-full mb-2">
            <div @click="showDetailsView(city.latitude, city.longitude, city.cityName)" class="flex items-center justify-between py-4 cursor-default hover:bg-slate-100 hover:rounded-xl">
              <div>
                <span class="font-semibold pl-2">{{ city.cityName }}</span>
              </div>
              <div>
                <img src="../src/assets/chevron-right.png" class="w-6 pr-2" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    </Transition>
    <Transition name="fade">
    <div v-if="viewType === 'details'" class="flex flex-col gap-8">
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
        <p v-if="currentLocationFlag" class="text-sm text-gray-400">Data for your current location</p>
      </div>
      <div>
        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-lg p-4 bg-slate-50">
            <div class="pb-2">
              <h3 class="tracking-wide text-xl text-slate-400">Sunrise</h3>
            </div>
            <div class="flex items-center gap-4">
              <img src="../src/assets/sunrise.png" class="w-8" />
              <span class="text-4xl">{{ formattedTime(weatherAPIData ? weatherAPIData?.daily.sunrise[0] : "n/a") }}</span>
            </div>
          </div>
          <div class="rounded-lg p-4 bg-slate-50">
            <div class="pb-2">
              <h3 class="tracking-wide text-xl text-slate-400">Sunset</h3>
            </div>
            <div class="flex items-center gap-4">
              <img src="../src/assets/sunset.png" class="w-8" />
              <span class="text-4xl">{{ formattedTime(weatherAPIData ? weatherAPIData?.daily.sunset[0] : "n/a") }}</span>
            </div>
          </div>
          <div class="rounded-lg p-4 bg-slate-50">
            <div class="pb-2">
              <h3 class="tracking-wide text-xl text-slate-400">Wind speed</h3>
            </div>
            <div class="flex items-center gap-4">
              <img src="../src/assets/wind.png" class="w-8" />
              <span class="text-4xl">{{ weatherAPIData ? weatherAPIData?.current.wind_speed_10m + " km/h" : "n/a" }}</span>
            </div>
          </div>
          <div class="rounded-lg p-4 bg-slate-50">
            <div class="pb-2">
              <h3 class="tracking-wide text-xl text-slate-400">Humidity</h3>
            </div>
            <div class="flex items-center gap-4">
              <img src="../src/assets/humidity.png" class="w-8" />
              <span class="text-4xl">{{ weatherAPIData ? weatherAPIData?.current.relative_humidity_2m + " %" : "n/a" }}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-400 pb-2">HOURLY FORECAST</p>
        <div class="overflow-x-auto flex gap-4 pb-8">
          <div v-for="(item, index) in combinedHourlyData.slice(0, 24)" :key="index" class="flex-shrink-0 bg-slate-50 rounded-xl aspect-square w-28">
            <div class="flex flex-col space-y-0">
              <div class="flex justify-center pt-1">
                <span class="medium text-slate-400">{{ index == 0 ? "now" : item.time }}</span>
              </div>
              <div class="flex justify-center">
                <img
                  :src="getWeatherDetails(String(item.weather_code), true).image"
                  :alt="getWeatherDetails(String(item.weather_code), true).description"
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
      <div>
        <p class="text-sm font-medium text-gray-400 pb-2">DAILY FORECAST</p>
        <ul>
          <li v-for="(day, index) in combinedDailyData" :key="index" class="border-b border-gray-100 last:border-b-0">
            <div class="flex items-center py-3 text-2xl">
              <div class="basis-1/4">
                <span class="font-medium">{{ getDayName(day.time) }}</span> 
              </div>
              <div class="basis-1/4">
                <img
                  :src="getWeatherDetails(String(day.weather_code), false).image"
                  :alt="getWeatherDetails(String(day.weather_code), false).description"
                  class="w-16"
                />
              </div>
              <div class="basis-1/2 tracking-wide">
                <span class="pl-8">{{ day.temperature_2m_min + "°C &nbsp; - &nbsp; " + day.temperature_2m_max }}°C</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    </Transition>
  </div>
  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
