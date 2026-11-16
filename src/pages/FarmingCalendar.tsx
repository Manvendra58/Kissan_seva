import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sprout, Sun, Cloud, Droplets, Loader2 } from 'lucide-react';
import { months } from '@/data/indianStates';

interface CalendarEntry {
  id: string;
  month: number;
  crop_name: string;
  activity: string;
  tips: string | null;
}

const FarmingCalendar = () => {
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      const { data } = await supabase.from('seasonal_calendar').select('*').order('month');

      setCalendarData(data && data.length > 0 ? data : []);
      setLoading(false);
    };

    fetchCalendar();
  }, []);

  const currentMonthData = calendarData.filter((d) => d.month === selectedMonth);

  const getSeasonIcon = (month: number) => {
    if (month >= 3 && month <= 5) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (month >= 6 && month <= 9) return <Cloud className="w-5 h-5 text-blue-500" />;
    return <Droplets className="w-5 h-5 text-cyan-500" />;
  };

  const getSeason = (month: number) => {
    if (month >= 6 && month <= 10) return 'Kharif';
    if (month >= 11 || month <= 3) return 'Rabi';
    return 'Zaid';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Seasonal Farming Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Month-wise farming activities and guidance
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {months.map((month) => (
            <button
              key={month.value}
              onClick={() => setSelectedMonth(month.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedMonth === month.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              {month.label.slice(0, 3)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : calendarData.length === 0 ? (
          <Card className="card-garden">
            <EmptyState
              icon={Calendar}
              title="No calendar entries yet"
              description="Seasonal activities will appear here once an admin publishes the farming calendar."
            />
          </Card>
        ) : (
          <>
            <Card className="card-garden bg-primary/5 border-primary/20">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getSeasonIcon(selectedMonth)}
                    <div>
                      <h2 className="text-2xl font-display font-bold">
                        {months.find((m) => m.value === selectedMonth)?.label}
                      </h2>
                      <p className="text-muted-foreground">{getSeason(selectedMonth)} Season</p>
                    </div>
                  </div>
                  <Badge className="badge-success text-lg px-4 py-2">
                    {currentMonthData.length} Activities
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMonthData.map((entry) => (
                <Card key={entry.id} className="card-garden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="icon-container">
                        <Sprout className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{entry.crop_name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {entry.activity}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {entry.tips && (
                    <CardContent>
                      <div className="p-3 rounded-lg bg-secondary">
                        <p className="text-sm text-muted-foreground">{entry.tips}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {currentMonthData.length === 0 && (
              <Card className="card-garden">
                <EmptyState
                  icon={Calendar}
                  title="No activities this month"
                  description="There are no scheduled farming activities for the selected month."
                />
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FarmingCalendar;
