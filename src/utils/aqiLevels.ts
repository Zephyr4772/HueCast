import { AQILevel } from '../types/aqi';

export const AQI_LEVELS: AQILevel[] = [
  {
    min: 0,
    max: 50,
    level: 'Good',
    description: 'Air quality is considered satisfactory',
    healthAdvice: 'Air quality is satisfactory and air pollution poses little or no risk.',
    color: 'text-green-800',
    bgColor: 'bg-green-100 border-green-200',
    emoji: '🟢'
  },
  {
    min: 51,
    max: 100,
    level: 'Moderate',
    description: 'Air quality is acceptable',
    healthAdvice: 'Air quality is acceptable for most people. However, sensitive groups may experience minor respiratory symptoms.',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100 border-yellow-200',
    emoji: '🟡'
  },
  {
    min: 101,
    max: 150,
    level: 'Unhealthy for Sensitive Groups',
    description: 'Sensitive groups may experience health effects',
    healthAdvice: 'Active children and adults, and people with respiratory disease should limit prolonged outdoor exertion.',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100 border-orange-200',
    emoji: '🟠'
  },
  {
    min: 151,
    max: 200,
    level: 'Unhealthy',
    description: 'Everyone may begin to experience health effects',
    healthAdvice: 'Active children and adults, and people with respiratory disease should avoid prolonged outdoor exertion.',
    color: 'text-red-800',
    bgColor: 'bg-red-100 border-red-200',
    emoji: '🔴'
  },
  {
    min: 201,
    max: 300,
    level: 'Very Unhealthy',
    description: 'Health alert: everyone may experience serious effects',
    healthAdvice: 'Active children and adults, and people with respiratory disease should avoid all outdoor exertion.',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100 border-purple-200',
    emoji: '🟣'
  },
  {
    min: 301,
    max: 999,
    level: 'Hazardous',
    description: 'Health warnings of emergency conditions',
    healthAdvice: 'Everyone should avoid all outdoor exertion. People with respiratory or heart disease should remain indoors.',
    color: 'text-gray-800',
    bgColor: 'bg-gray-900 border-gray-700 text-white',
    emoji: '⚫'
  }
];

export const getAQILevel = (aqi: number): AQILevel => {
  return AQI_LEVELS.find(level => aqi >= level.min && aqi <= level.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
};

export const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#10B981'; // Green
  if (aqi <= 100) return '#F59E0B'; // Yellow
  if (aqi <= 150) return '#F97316'; // Orange
  if (aqi <= 200) return '#EF4444'; // Red
  if (aqi <= 300) return '#8B5CF6'; // Purple
  return '#374151'; // Gray/Black
};