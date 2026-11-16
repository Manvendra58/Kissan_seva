import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fetchLiveWeather, type LiveWeather } from '@/lib/weather';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Sun, Droplets, AlertTriangle, Thermometer, Loader2, Wind } from 'lucide-react';

interface AdminWeatherUpdate {
  id: string;
  state: string | null;
  district: string | null;
  temperature: number | null;
  humidity: number | null;
  rainfall_probability: number | null;
  weather_condition: string | null;
  alert_type: string | null;
  alert_message: string | null;
  forecast_date: string;
}

const WeatherPage = () => {
  const { profile } = useAuth();
  const [live, setLive] = useState<LiveWeather | null>(null);
  const [adminWeather, setAdminWeather] = useState<AdminWeatherUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const [{ data: adminData }, liveResult] = await Promise.all([
        supabase
          .from('weather_updates')
          .select('*')
          .order('forecast_date', { ascending: false }),
        fetchLiveWeather(profile?.district, profile?.state)
          .then((w) => ({ ok: true as const, weather: w }))
          .catch((err: Error) => ({ ok: false as const, error: err.message })),
      ]);

      setAdminWeather(adminData || []);

      if (liveResult.ok) {
        setLive(liveResult.weather);
      } else {
        setLive(null);
        setError(liveResult.error || 'Could not load live weather');
      }

      setLoading(false);
    };

    load();
  }, [profile?.district, profile?.state]);

  const getWeatherIcon = (condition: string | null) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-12 h-12 text-yellow-500" />;
      case 'rainy':
      case 'drizzle':
      case 'thunderstorm':
        return <Droplets className="w-12 h-12 text-blue-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-12 h-12 text-gray-500" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-400" />;
    }
  };

  const adminAlerts = adminWeather.filter((w) => w.alert_message);
  const liveAlert = live?.alertMessage
    ? [{ id: 'live', alert_type: live.alertType, alert_message: live.alertMessage, district: profile?.district, state: profile?.state }]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Cloud className="w-8 h-8 text-sky" />
            Weather Forecast
          </h1>
          <p className="text-muted-foreground mt-1">
            Live conditions for your region
            {live ? ' • Open-Meteo' : ''}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !live ? (
          <Card className="card-garden">
            <EmptyState
              icon={Cloud}
              title="Live weather unavailable"
              description={
                error ||
                'Could not fetch weather right now. Check your connection or add district/state in Profile.'
              }
            />
          </Card>
        ) : (
          <>
            <Card className="card-garden overflow-hidden">
              <div className="weather-card p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-white/80 text-lg">{live.locationLabel}</p>
                    <div className="flex items-end gap-4 mt-2">
                      <p className="text-6xl font-bold text-white">
                        {live.temperature != null ? `${live.temperature}°C` : '—'}
                      </p>
                      <p className="text-xl text-white/80 mb-2">{live.weatherCondition}</p>
                    </div>
                    <Badge className="mt-3 bg-white/20 text-white border-white/30 hover:bg-white/25">
                      Live data
                    </Badge>
                  </div>
                  <div className="flex items-center gap-8">
                    {getWeatherIcon(live.weatherCondition)}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-white/90">
                        <Droplets className="w-5 h-5" />
                        <span>
                          Humidity: {live.humidity != null ? `${live.humidity}%` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-white/90">
                        <Cloud className="w-5 h-5" />
                        <span>
                          Rain:{' '}
                          {live.rainfallProbability != null
                            ? `${live.rainfallProbability}%`
                            : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-white/90">
                        <Wind className="w-5 h-5" />
                        <span>
                          Wind: {live.windSpeed != null ? `${live.windSpeed} km/h` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {(liveAlert.length > 0 || adminAlerts.length > 0) && (
              <Card className="card-garden border-destructive/30">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Weather Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {liveAlert.map((alert) => (
                    <div key={alert.id} className="alert-danger">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{alert.alert_type}</p>
                        <Badge variant="destructive">Live</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
                    </div>
                  ))}
                  {adminAlerts.map((alert) => (
                    <div key={alert.id} className="alert-danger">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{alert.alert_type}</p>
                        <Badge variant="destructive">
                          {alert.district}, {alert.state}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.alert_message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {adminWeather.length > 0 && (
              <Card className="card-garden">
                <CardHeader>
                  <CardTitle className="font-display">Admin regional updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {adminWeather.map((w) => (
                      <div
                        key={w.id}
                        className={`p-4 rounded-xl border ${
                          w.district === profile?.district
                            ? 'border-primary bg-primary/5'
                            : 'bg-secondary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold">{w.district}</p>
                            <p className="text-xs text-muted-foreground">{w.state}</p>
                          </div>
                          {getWeatherIcon(w.weather_condition)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Thermometer className="w-4 h-4" />
                              Temp
                            </span>
                            <span className="font-medium">
                              {w.temperature != null ? `${w.temperature}°C` : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Droplets className="w-4 h-4" />
                              Humidity
                            </span>
                            <span className="font-medium">
                              {w.humidity != null ? `${w.humidity}%` : '—'}
                            </span>
                          </div>
                        </div>
                        {w.alert_type && (
                          <Badge variant="destructive" className="mt-3 w-full justify-center">
                            {w.alert_type}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WeatherPage;
