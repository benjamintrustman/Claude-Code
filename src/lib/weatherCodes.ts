import type { ComponentType } from 'react'
import {
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  SunIcon,
} from '../components/icons'

export type WeatherCodeInfo = {
  label: string
  Icon: ComponentType<{ className?: string }>
}

const CODES: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', Icon: SunIcon },
  1: { label: 'Mainly clear', Icon: CloudSunIcon },
  2: { label: 'Partly cloudy', Icon: CloudSunIcon },
  3: { label: 'Overcast', Icon: CloudIcon },
  45: { label: 'Fog', Icon: CloudFogIcon },
  48: { label: 'Rime fog', Icon: CloudFogIcon },
  51: { label: 'Light drizzle', Icon: CloudRainIcon },
  53: { label: 'Drizzle', Icon: CloudRainIcon },
  55: { label: 'Dense drizzle', Icon: CloudRainIcon },
  56: { label: 'Light freezing drizzle', Icon: CloudRainIcon },
  57: { label: 'Freezing drizzle', Icon: CloudRainIcon },
  61: { label: 'Light rain', Icon: CloudRainIcon },
  63: { label: 'Rain', Icon: CloudRainIcon },
  65: { label: 'Heavy rain', Icon: CloudRainIcon },
  66: { label: 'Light freezing rain', Icon: CloudRainIcon },
  67: { label: 'Freezing rain', Icon: CloudRainIcon },
  71: { label: 'Light snow', Icon: CloudSnowIcon },
  73: { label: 'Snow', Icon: CloudSnowIcon },
  75: { label: 'Heavy snow', Icon: CloudSnowIcon },
  77: { label: 'Snow grains', Icon: CloudSnowIcon },
  80: { label: 'Light rain showers', Icon: CloudRainIcon },
  81: { label: 'Rain showers', Icon: CloudRainIcon },
  82: { label: 'Violent rain showers', Icon: CloudRainIcon },
  85: { label: 'Light snow showers', Icon: CloudSnowIcon },
  86: { label: 'Snow showers', Icon: CloudSnowIcon },
  95: { label: 'Thunderstorm', Icon: CloudLightningIcon },
  96: { label: 'Thunderstorm with hail', Icon: CloudLightningIcon },
  99: { label: 'Thunderstorm with heavy hail', Icon: CloudLightningIcon },
}

export function weatherCodeInfo(code: number): WeatherCodeInfo {
  return CODES[code] ?? { label: 'Unknown conditions', Icon: CloudIcon }
}
