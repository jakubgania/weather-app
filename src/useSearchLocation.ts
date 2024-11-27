
export function useSearchLocation() {
  const getCoordinates = async (locationName: string): Promise<{ latitude: number; longitude: number; cityName: string, country: string, countryCode: string, admin1: string}[] | null> => {
		if (!locationName) {
			alert('Search bar is empty!')
			return null
		}

		try {
			const numberOfItems = 8;
			const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locationName}&count=${numberOfItems}&language=en&format=json`);
			const data = await response.json()

			if (data.results && data.results.length > 0) {
				const results = data.results.map((result: any) => ({
					latitude: result.latitude,
					longitude: result.longitude,
					cityName: result.name,
					country: result.country,
					countryCode: result.country_code,
					admin1: result.admin1
				}))
	
				return results;
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