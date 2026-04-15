import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export interface AdvisoryInput {
  pincode: string;
  city: string;
  workerName: string;
  hasActivePolicy: boolean;
  tier: string;
  nextWeatherForecast: {
    description: string;
    rainMmExpected: number;
    maxTempC: number;
    aqiLevel?: number;
  };
  lastClaimDate?: string;
  policyExpiresInHours?: number;
}

export interface Advisory {
  type: 'warning' | 'opportunity' | 'info' | 'urgent';
  emoji: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

// Fetch weather forecast from Open-Meteo (free, no key required)
export async function fetchWeatherForecast(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum,temperature_2m_max,weathercode&forecast_days=3&timezone=Asia/Kolkata`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      rainMmExpected: data.daily?.precipitation_sum?.[0] || 0,
      maxTempC: data.daily?.temperature_2m_max?.[0] || 30,
      description: data.daily?.weathercode?.[0] > 60 ? 'Heavy rain expected' : 'Clear conditions',
    };
  } catch {
    return { rainMmExpected: 0, maxTempC: 30, description: 'Forecast unavailable' };
  }
}

export async function generateAdvisories(input: AdvisoryInput): Promise<Advisory[]> {
  const advisories: Advisory[] = [];

  // Rule-based advisories (fast, no API call)
  if (input.nextWeatherForecast.rainMmExpected > 15) {
    advisories.push({
      type: 'warning',
      emoji: '🌧️',
      title: 'Heavy rain forecast',
      message: `${input.nextWeatherForecast.rainMmExpected.toFixed(0)}mm rain expected. ${input.hasActivePolicy ? 'Your coverage is active.' : 'Get covered now for just ₹12.'}`,
      actionLabel: input.hasActivePolicy ? 'View policy' : 'Get covered',
      actionUrl: input.hasActivePolicy ? '/dashboard' : '/onboard',
    });
  }

  if (input.nextWeatherForecast.maxTempC > 43) {
    advisories.push({
      type: 'warning',
      emoji: '☀️',
      title: 'Extreme heat alert',
      message: `${input.nextWeatherForecast.maxTempC}°C forecast. Heatwave triggers are active in your plan.`,
    });
  }

  if ((input.nextWeatherForecast.aqiLevel || 0) > 301) {
    advisories.push({
      type: 'urgent',
      emoji: '😷',
      title: 'Hazardous air quality',
      message: `AQI ${input.nextWeatherForecast.aqiLevel} detected. Consider limiting outdoor hours today.`,
    });
  }

  if (input.policyExpiresInHours && input.policyExpiresInHours < 48) {
    advisories.push({
      type: 'urgent',
      emoji: '⚠️',
      title: 'Coverage expiring soon',
      message: `Your plan expires in ${input.policyExpiresInHours} hours. Renew to stay protected.`,
      actionLabel: 'Renew now',
      actionUrl: '/dashboard#renew',
    });
  }

  if (!input.hasActivePolicy && input.nextWeatherForecast.rainMmExpected > 5) {
    advisories.push({
      type: 'opportunity',
      emoji: '🛡️',
      title: 'Rain is coming — get covered',
      message: 'A ₹12 daily shield today protects against incoming rainfall.',
      actionLabel: 'Buy ₹12 Daily Shield',
      actionUrl: '/onboard',
    });
  }

  return advisories;
}
