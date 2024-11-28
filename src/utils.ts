import { City } from "./types";

// rounds the temperature to one digit
export const transformNumber = (temperature: number): number => {
  return Math.round(Number(temperature));
};

// returns the day name from an ISO date string
export const getDayName = (isoDate: string): string => {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
};

// formats time into HH:MM format
export const formattedTime = (originalTime: string): string => {
  const dateObj = new Date(originalTime);

  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// formats the location description
export const formatLabelDescription = (city: City | undefined) => {
  const tempCountry = city?.country ? city.country : '';
  const separator = city?.admin1 ? " - " + city.admin1 : '';
  const tempCountryCode = city?.countryCode ? " | " + city.countryCode : '';

  return tempCountry + separator + tempCountryCode
};