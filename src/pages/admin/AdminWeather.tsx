import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Cloud, Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { indianStates } from '@/data/indianStates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface WeatherUpdate {
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

const AdminWeather = () => {
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWeather, setEditingWeather] = useState<WeatherUpdate | null>(null);
  
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [rainfallProbability, setRainfallProbability] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [forecastDate, setForecastDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchWeather = async () => {
    const { data } = await supabase.from('weather_updates').select('*').order('forecast_date', { ascending: false });
    if (data) setWeather(data);
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const resetForm = () => {
    setState('');
    setDistrict('');
    setTemperature('');
    setHumidity('');
    setRainfallProbability('');
    setWeatherCondition('');
    setAlertType('');
    setAlertMessage('');
    setForecastDate(new Date().toISOString().split('T')[0]);
    setEditingWeather(null);
  };

  const openEditDialog = (w: WeatherUpdate) => {
    setEditingWeather(w);
    setState(w.state || '');
    setDistrict(w.district || '');
    setTemperature(w.temperature?.toString() || '');
    setHumidity(w.humidity?.toString() || '');
    setRainfallProbability(w.rainfall_probability?.toString() || '');
    setWeatherCondition(w.weather_condition || '');
    setAlertType(w.alert_type || '');
    setAlertMessage(w.alert_message || '');
    setForecastDate(w.forecast_date);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const weatherData = {
      state,
      district,
      temperature: parseFloat(temperature) || null,
      humidity: parseFloat(humidity) || null,
      rainfall_probability: parseFloat(rainfallProbability) || null,
      weather_condition: weatherCondition,
      alert_type: alertType || null,
      alert_message: alertMessage || null,
      forecast_date: forecastDate,
    };

    let error;
    if (editingWeather) {
      ({ error } = await supabase.from('weather_updates').update(weatherData).eq('id', editingWeather.id));
    } else {
      ({ error } = await supabase.from('weather_updates').insert(weatherData));
    }

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Weather ${editingWeather ? 'updated' : 'added'} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchWeather();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this weather update?')) return;
    const { error } = await supabase.from('weather_updates').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchWeather(); }
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Cloud className="w-8 h-8 text-sky" />
              Weather Updates
            </h1>
            <p className="text-muted-foreground mt-1">Manage weather forecasts and alerts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Update</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">{editingWeather ? 'Edit' : 'Add'} Weather</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {indianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Temp (°C)</Label>
                    <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Humidity (%)</Label>
                    <Input type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rain (%)</Label>
                    <Input type="number" value={rainfallProbability} onChange={(e) => setRainfallProbability(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunny">Sunny</SelectItem>
                      <SelectItem value="Partly Cloudy">Partly Cloudy</SelectItem>
                      <SelectItem value="Cloudy">Cloudy</SelectItem>
                      <SelectItem value="Rainy">Rainy</SelectItem>
                      <SelectItem value="Stormy">Stormy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Alert Type (Optional)</Label>
                    <Input value={alertType} onChange={(e) => setAlertType(e.target.value)} placeholder="e.g., Heavy Rain" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={forecastDate} onChange={(e) => setForecastDate(e.target.value)} required />
                  </div>
                </div>
                {alertType && (
                  <div className="space-y-2">
                    <Label>Alert Message</Label>
                    <Input value={alertMessage} onChange={(e) => setAlertMessage(e.target.value)} placeholder="Warning details..." />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingWeather ? 'Update' : 'Add'} Weather
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-garden">
          <CardHeader>
            <CardTitle className="font-display">Weather Records ({weather.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weather.map((w) => (
                <div key={w.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{w.district}</h3>
                      <p className="text-sm text-muted-foreground">{w.state}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(w)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <p>🌡️ {w.temperature}°C | 💧 {w.humidity}% | 🌧️ {w.rainfall_probability}%</p>
                    <p className="text-muted-foreground">{w.weather_condition}</p>
                    <p className="text-xs text-muted-foreground">{new Date(w.forecast_date).toLocaleDateString()}</p>
                  </div>
                  {w.alert_type && (
                    <Badge variant="destructive" className="mt-2">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {w.alert_type}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminWeather;
