import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_active: boolean;
  created_at: string;
}

const AdminNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState('general');

  const fetchNotifications = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.from('notifications').insert({
      title,
      message,
      notification_type: notificationType,
      is_active: true,
    });

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Notification Sent", description: "All farmers will see this notification." });
      setTitle('');
      setMessage('');
      setIsDialogOpen(false);
      fetchNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchNotifications(); }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase.from('notifications').update({ is_active: !currentState }).eq('id', id);
    if (!error) fetchNotifications();
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Bell className="w-8 h-8 text-accent" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">Send alerts and updates to farmers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> New Notification</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Send Notification</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Important Update" required />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  >
                    <option value="general">General</option>
                    <option value="scheme">Scheme Update</option>
                    <option value="weather">Weather Alert</option>
                    <option value="market">Market Update</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send to All Farmers
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-garden">
          <CardHeader>
            <CardTitle className="font-display">All Notifications ({notifications.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-4 rounded-lg border ${notif.is_active ? 'bg-card' : 'bg-muted/50'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{notif.title}</h3>
                      <Badge variant="secondary">{notif.notification_type}</Badge>
                      {!notif.is_active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Sent: {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => toggleActive(notif.id, notif.is_active)}>
                      {notif.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(notif.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;
