
export function useGeoLocation() {
  const getBrowserCoordinates = async (): Promise<{ latitude: number; longitude: number } | null> => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return null;
    }

    return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to retrieve your location.');
          resolve(null);
        }
      );
    }).catch(() => null);
  };

  return {
    getBrowserCoordinates,
  };
}