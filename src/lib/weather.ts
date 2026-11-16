export interface LiveWeather {
  locationLabel: string;
  temperature: number | null;
  humidity: number | null;
  rainfallProbability: number | null;
  weatherCondition: string;
  windSpeed: number | null;
  alertType: string | null;
  alertMessage: string | null;
  forecastDate: string;
  source: 'open-meteo';
}

const WMO_CODES: Record<number, string> = {
  0: 'Sunny',
  1: 'Partly Cloudy',
  2: 'Partly Cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Foggy',
  51: 'Drizzle',
  53: 'Drizzle',
  55: 'Drizzle',
  61: 'Rainy',
  63: 'Rainy',
  65: 'Rainy',
  66: 'Rainy',
  67: 'Rainy',
  71: 'Snow',
  73: 'Snow',
  75: 'Snow',
  77: 'Snow',
  80: 'Rainy',
  81: 'Rainy',
  82: 'Rainy',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
};

function conditionFromCode(code: number | undefined): string {
  if (code == null) return 'Unknown';
  return WMO_CODES[code] || 'Cloudy';
}

function buildAlert(temp: number | null, rainProb: number | null, code: number | undefined) {
  if (code != null && [95, 96, 99].includes(code)) {
    return {
      alertType: 'Thunderstorm',
      alertMessage: 'Thunderstorm conditions possible. Secure equipment and avoid open fields.',
    };
  }
  if (rainProb != null && rainProb >= 70) {
    return {
      alertType: 'Heavy Rain',
      alertMessage: 'High chance of rain. Delay pesticide spraying and protect harvested produce.',
    };
  }
  if (temp != null && temp >= 40) {
    return {
      alertType: 'Heat Wave',
      alertMessage: 'High temperatures. Irrigate during cooler hours and protect livestock.',
    };
  }
  return { alertType: null, alertMessage: null };
}

async function geocodeLocation(district?: string | null, state?: string | null) {
  const query = [district, state, 'India'].filter(Boolean).join(', ');
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query || 'New Delhi, India');
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to geocode location');

  const data = await res.json();
  const place = data.results?.[0];
  if (!place) {
    // Fallback: New Delhi
    return {
      latitude: 28.6139,
      longitude: 77.209,
      label: district && state ? `${district}, ${state}` : 'New Delhi, India',
    };
  }

  return {
    latitude: place.latitude as number,
    longitude: place.longitude as number,
    label: [place.name, place.admin1].filter(Boolean).join(', ') || query,
  };
}

/** Fetch live weather for a farmer district/state using Open-Meteo (no API key). */
export async function fetchLiveWeather(
  district?: string | null,
  state?: string | null
): Promise<LiveWeather> {
  const place = await geocodeLocation(district, state);

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(place.latitude));
  url.searchParams.set('longitude', String(place.longitude));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m');
  url.searchParams.set('daily', 'precipitation_probability_max,weather_code,temperature_2m_max');
  url.searchParams.set('timezone', 'Asia/Kolkata');
  url.searchParams.set('forecast_days', '1');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch weather');

  const data = await res.json();
  const current = data.current || {};
  const daily = data.daily || {};

  const temperature =
    typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m) : null;
  const humidity =
    typeof current.relative_humidity_2m === 'number' ? Math.round(current.relative_humidity_2m) : null;
  const rainfallProbability =
    typeof daily.precipitation_probability_max?.[0] === 'number'
      ? Math.round(daily.precipitation_probability_max[0])
      : null;
  const code = current.weather_code as number | undefined;
  const weatherCondition = conditionFromCode(code);
  const { alertType, alertMessage } = buildAlert(temperature, rainfallProbability, code);

  return {
    locationLabel: place.label,
    temperature,
    humidity,
    rainfallProbability,
    weatherCondition,
    windSpeed:
      typeof current.wind_speed_10m === 'number' ? Math.round(current.wind_speed_10m) : null,
    alertType,
    alertMessage,
    forecastDate: new Date().toISOString(),
    source: 'open-meteo',
  };
}
