import { City, GeocodingApiResponse } from './types'
import { API_SEARCH_ENDPOINT } from './constants';

export function useSearchLocation() {
  const getCoordinates = async (locationName: string): Promise<City[] | null> => {
		if (!locationName) {
			alert('Search bar is empty!')
			return null
		}

		const numberOfItems = 8;
    const params = new URLSearchParams({
      name: locationName,
      count: String(numberOfItems),
      language: 'en',
      format: 'json'
    })

		try {
			const response = await fetch(API_SEARCH_ENDPOINT + '?' + params.toString())

			if (!response.ok) {
				throw new Error(`API error: ${response.statusText}`)
			}
			
			const data: GeocodingApiResponse = await response.json()

			if (data.results?.length > 0) {
				return data.results.map((result) => ({
					latitude: result.latitude,
					longitude: result.longitude,
					cityName: result.name,
					country: result.country,
					countryCode: result.country_code,
					admin1: result.admin1
				}))
			} else {
				alert('Location not found!');

				return null
			} 
		} catch (error) {
			console.error('Error fetching coordinates:', error);
			
      return null;
		}
  };

	return {
		getCoordinates
	};
}