import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cloud,
  Droplets,
  Thermometer,
  TrendingUp,
  Bell,
  Leaf,
  Calendar,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Sun,
  Wheat,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { fetchLiveWeather } from '@/lib/weather';

interface WeatherData {
  temperature: number | null;
  humidity: number | null;
  rainfall_probability: number | null;
  weather_condition: string;
  alert_message: string | null;
}

interface MarketPrice {
  crop_name: string;
  price_per_quintal: number;
  market_name: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
}

const INITIAL_PRICE_LIMIT = 3;

const Dashboard = () => {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAllPrices, setShowAllPrices] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const live = await fetchLiveWeather(profile?.district, profile?.state);
        setWeather({
          temperature: live.temperature,
          humidity: live.humidity,
          rainfall_probability: live.rainfallProbability,
          weather_condition: live.weatherCondition,
          alert_message: live.alertMessage,
        });
      } catch {
        if (profile?.district) {
          const { data: weatherData } = await supabase
            .from('weather_updates')
            .select('*')
            .eq('district', profile.district)
            .order('forecast_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (weatherData) {
            setWeather({
              temperature: weatherData.temperature,
              humidity: weatherData.humidity,
              rainfall_probability: weatherData.rainfall_probability,
              weather_condition: weatherData.weather_condition || 'Unknown',
              alert_message: weatherData.alert_message,
            });
          }
        }
      }

      const { data: priceData } = await supabase
        .from('market_prices')
        .select('*')
        .order('price_date', { ascending: false });

      if (priceData) setPrices(priceData);

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (notifData) setNotifications(notifData);
    };

    fetchDashboardData();
  }, [profile]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200/50">
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent">
              {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Farmer'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile?.district && profile?.state 
                ? `${profile.district}, ${profile.state}` 
                : 'Welcome to your farming dashboard'}
              {profile?.crop_type && ` • Growing ${profile.crop_type}`}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/queries">
              <Button variant="outline" className="gap-2">
                <Bell className="w-4 h-4" />
                Support
              </Button>
            </Link>
            <Link to="/crops">
              <Button className="gap-2">
                <Leaf className="w-4 h-4" />
                Explore Crops
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid - Funky Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Weather Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="weather-card-funky p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm">Today's Weather</p>
                  <p className="text-3xl font-bold mt-1">
                    {weather?.temperature != null ? `${weather.temperature}°C` : '—'}
                  </p>
                </div>
                <Sun className="w-10 h-10 text-yellow-300" />
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-white/90">
                <span className="flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  {weather?.humidity != null ? `${weather.humidity}%` : '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  {weather?.rainfall_probability != null
                    ? `${weather.rainfall_probability}%`
                    : '—'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="stat-card-funky bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/70 hover:border-emerald-400">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Wheat className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Crop</p>
                <p className="text-xl font-bold text-emerald-800">{profile?.crop_type || 'Not Set'}</p>
              </div>
            </div>
          </Card>

          <Card className="stat-card-funky bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/70 hover:border-amber-400">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Price</p>
                <p className="text-xl font-bold text-amber-800">
                  {prices.length > 0
                    ? `₹${Math.round(
                        prices.reduce((a, b) => a + Number(b.price_per_quintal), 0) / prices.length
                      ).toLocaleString()}/Q`
                    : '—'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="stat-card-funky bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200/70 hover:border-violet-400">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-violet-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Season</p>
                <p className="text-xl font-bold text-violet-800">
                  {new Date().getMonth() >= 6 && new Date().getMonth() <= 9 ? 'Kharif' : 'Rabi'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Prices */}
          <Card className="card-garden lg:col-span-2 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-amber-50/80 to-orange-50/50 border-b border-amber-200/40">
              <div>
                <CardTitle className="font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Latest Market Prices
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Per quintal • {profile?.district ? `${profile.district} & nearby` : 'Across India'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowAllPrices(!showAllPrices)}
                >
                  {showAllPrices ? (
                    <>Show Less <ArrowUp className="w-4 h-4" /></>
                  ) : (
                    <>View All <ArrowDown className="w-4 h-4" /></>
                  )}
                </Button>
                <Link to="/market-prices">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                    Full Page <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {prices.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No market prices yet"
                  description="Mandi rates will show here after an admin publishes them."
                />
              ) : (
                <div className="space-y-3">
                  {prices
                    .slice(0, showAllPrices ? undefined : INITIAL_PRICE_LIMIT)
                    .map((price, index) => (
                      <div
                        key={index}
                        className={`price-card flex items-center justify-between p-3 rounded-xl ${
                          price.crop_name === profile?.crop_type
                            ? 'bg-primary/5 border-2 border-primary/30'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Wheat className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{price.crop_name}</p>
                              {price.crop_name === profile?.crop_type && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                  Your Crop
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {price.market_name ||
                                (profile?.district
                                  ? `APMC • ${profile.district}`
                                  : 'Local Mandi')}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-primary">
                          ₹{Number(price.price_per_quintal).toLocaleString()}/Q
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications & Alerts */}
          <Card className="card-garden overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-50/80 to-purple-50/50 border-b border-violet-200/40">
              <CardTitle className="font-display flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Alerts & Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weather?.alert_message && (
                  <div className="alert-warning">
                    <p className="font-medium text-sm">⚠️ Weather Alert</p>
                    <p className="text-sm text-muted-foreground">{weather.alert_message}</p>
                  </div>
                )}
                
                {notifications.length === 0 && !weather?.alert_message ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No alerts right now. New updates will appear here when published.
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="alert-success">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {notif.notification_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                    </div>
                  ))
                )}

                <Link to="/schemes" className="block">
                  <Button variant="outline" className="w-full mt-2">
                    View All Schemes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Funky Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <Link to="/crops" className="block">
            <Card className="action-tile-funky card-garden p-6 text-center cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/60 hover:border-green-500 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-8 h-8 text-green-700" />
              </div>
              <p className="font-bold text-green-800">Crop Guide</p>
              <p className="text-xs text-muted-foreground mt-1">🌱 Learn & grow</p>
            </Card>
          </Link>
          <Link to="/schemes" className="block">
            <Card className="action-tile-funky card-garden p-6 text-center cursor-pointer bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/60 hover:border-amber-500 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-8 h-8 text-amber-700" />
              </div>
              <p className="font-bold text-amber-800">Govt Schemes</p>
              <p className="text-xs text-muted-foreground mt-1">🏛️ Subsidies & more</p>
            </Card>
          </Link>
          <Link to="/calendar" className="block">
            <Card className="action-tile-funky card-garden p-6 text-center cursor-pointer bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-200/60 hover:border-sky-500 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-sky-700" />
              </div>
              <p className="font-bold text-sky-800">Farming Calendar</p>
              <p className="text-xs text-muted-foreground mt-1">📅 Plan your season</p>
            </Card>
          </Link>
          <Link to="/queries" className="block">
            <Card className="action-tile-funky card-garden p-6 text-center cursor-pointer bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200/60 hover:border-violet-500 hover:shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
                <Cloud className="w-8 h-8 text-violet-700" />
              </div>
              <p className="font-bold text-violet-800">Get Support</p>
              <p className="text-xs text-muted-foreground mt-1">💬 Ask experts</p>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
