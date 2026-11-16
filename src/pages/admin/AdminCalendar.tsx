import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { months, cropTypes } from '@/data/indianStates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalendarEntry {
  id: string;
  month: number;
  crop_name: string;
  activity: string;
  tips: string | null;
}

const AdminCalendar = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);

  const [cropName, setCropName] = useState('');
  const [month, setMonth] = useState('');
  const [activity, setActivity] = useState('');
  const [tips, setTips] = useState('');

  const fetchEntries = async () => {
    const { data } = await supabase
      .from('seasonal_calendar')
      .select('*')
      .order('month');
    if (data) setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const resetForm = () => {
    setCropName('');
    setMonth('');
    setActivity('');
    setTips('');
    setEditingEntry(null);
  };

  const openEditDialog = (entry: CalendarEntry) => {
    setEditingEntry(entry);
    setCropName(entry.crop_name);
    setMonth(entry.month.toString());
    setActivity(entry.activity);
    setTips(entry.tips || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const entryData = {
      crop_name: cropName,
      month: parseInt(month),
      activity,
      tips: tips || null,
    };

    let error;
    if (editingEntry) {
      ({ error } = await supabase.from('seasonal_calendar').update(entryData).eq('id', editingEntry.id));
    } else {
      ({ error } = await supabase.from('seasonal_calendar').insert(entryData));
    }

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Calendar entry ${editingEntry ? 'updated' : 'added'}` });
      resetForm();
      setIsDialogOpen(false);
      fetchEntries();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this calendar entry?')) return;
    const { error } = await supabase.from('seasonal_calendar').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchEntries(); }
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              Farming Calendar
            </h1>
            <p className="text-muted-foreground mt-1">Manage seasonal farming activities</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="w-4 h-4" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editingEntry ? 'Edit' : 'Add'} Calendar Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Crop</Label>
                  <Select value={cropName} onValueChange={setCropName} required>
                    <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={month} onValueChange={setMonth} required>
                    <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Activity</Label>
                  <Input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="e.g., Sowing, Harvesting" required />
                </div>
                <div className="space-y-2">
                  <Label>Tips (Optional)</Label>
                  <Textarea value={tips} onChange={(e) => setTips(e.target.value)} rows={3} placeholder="Farming tips..." />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingEntry ? 'Update' : 'Add'} Entry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-garden">
          <CardHeader>
            <CardTitle className="font-display">All Entries ({entries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {months.map((m) => {
                const monthEntries = entries.filter((e) => e.month === m.value);
                if (monthEntries.length === 0) return null;
                return (
                  <div key={m.value} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{m.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {monthEntries.map((entry) => (
                        <div key={entry.id} className="p-3 rounded-lg bg-secondary flex justify-between items-start">
                          <div>
                            <p className="font-medium">{entry.crop_name}</p>
                            <p className="text-sm text-muted-foreground">{entry.activity}</p>
                            {entry.tips && <p className="text-xs text-muted-foreground mt-1">💡 {entry.tips}</p>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCalendar;
