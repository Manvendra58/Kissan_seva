import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Plus, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { queryCategories } from '@/data/indianStates';

interface Query {
  id: string;
  category: string | null;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

const QueriesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchQueries = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('farmer_queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setQueries(data);
  };

  useEffect(() => {
    fetchQueries();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('farmer_queries')
      .insert({
        user_id: user.id,
        category,
        subject,
        message,
        status: 'pending',
      });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit query. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Query Submitted",
        description: "Your query has been submitted. We'll respond soon.",
      });
      setCategory('');
      setSubject('');
      setMessage('');
      setIsDialogOpen(false);
      fetchQueries();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="badge-success"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>;
      case 'in_progress':
        return <Badge className="badge-warning"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge className="badge-pending"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              My Queries
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit questions and get expert advice
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Query
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Submit a Query</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {queryCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief subject of your query"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Your Question</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your question in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Query
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {queries.length === 0 ? (
          <Card className="card-garden">
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No queries yet</h3>
              <p className="text-muted-foreground mb-4">
                Have a question about farming? Submit your first query.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Submit Query
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <Card key={query.id} className="card-garden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{query.subject}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {query.category && (
                          <Badge variant="secondary">{query.category}</Badge>
                        )}
                        {getStatusBadge(query.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(query.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm font-medium mb-1">Your Question:</p>
                    <p className="text-muted-foreground">{query.message}</p>
                  </div>
                  
                  {query.admin_response && (
                    <div className="alert-success">
                      <p className="text-sm font-medium mb-1">Expert Response:</p>
                      <p className="text-muted-foreground">{query.admin_response}</p>
                      {query.responded_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on {new Date(query.responded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QueriesPage;
