import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Clock, CheckCircle, Loader2, Send } from 'lucide-react';

interface FarmerProfile {
  full_name: string;
  district: string | null;
  email: string | null;
}

interface Query {
  id: string;
  user_id: string;
  category: string | null;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  farmer?: FarmerProfile;
}

const AdminQueries = () => {
  const { toast } = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('farmer_queries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      setQueries([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(data.map((q) => q.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, district, email')
      .in('user_id', userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [
        p.user_id,
        {
          full_name: p.full_name,
          district: p.district,
          email: p.email,
        } satisfies FarmerProfile,
      ])
    );

    setQueries(
      data.map((q) => ({
        ...q,
        farmer: profileMap.get(q.user_id),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleRespond = async (queryId: string) => {
    const response = responses[queryId];
    if (!response?.trim()) return;

    setLoadingId(queryId);
    const { error } = await supabase
      .from('farmer_queries')
      .update({
        admin_response: response,
        status: 'resolved',
        responded_at: new Date().toISOString(),
      })
      .eq('id', queryId);

    setLoadingId(null);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Response saved',
        description: 'The farmer will see your reply in My Queries.',
      });
      setResponses({ ...responses, [queryId]: '' });
      fetchQueries();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <Badge className="badge-success">
            <CheckCircle className="w-3 h-3 mr-1" /> Resolved
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="badge-warning">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="badge-pending">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  const pendingQueries = queries.filter((q) => q.status === 'pending');
  const resolvedQueries = queries.filter((q) => q.status === 'resolved');

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-primary" />
            Farmer Queries
          </h1>
          <p className="text-muted-foreground mt-1">
            Respond to farmer questions and support requests
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="card-garden">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Clock className="w-5 h-5 text-destructive" />
                  Pending Queries ({pendingQueries.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingQueries.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="No pending queries"
                    description="You're all caught up. New farmer questions will appear here."
                  />
                ) : (
                  pendingQueries.map((query) => (
                    <div key={query.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{query.subject}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {query.farmer?.full_name || 'Unknown farmer'}
                            </span>
                            {query.farmer?.email && <span>• {query.farmer.email}</span>}
                            {query.farmer?.district && <span>• {query.farmer.district}</span>}
                            {query.category && <Badge variant="secondary">{query.category}</Badge>}
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(query.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(query.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-secondary mb-4">
                        <p className="text-sm">{query.message}</p>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Type your response..."
                          value={responses[query.id] || ''}
                          onChange={(e) =>
                            setResponses({ ...responses, [query.id]: e.target.value })
                          }
                          rows={3}
                        />
                        <Button
                          onClick={() => handleRespond(query.id)}
                          disabled={loadingId === query.id || !responses[query.id]?.trim()}
                          className="gap-2"
                        >
                          {loadingId === query.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Send Response
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="card-garden">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Resolved ({resolvedQueries.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resolvedQueries.length === 0 ? (
                  <EmptyState
                    icon={MessageCircle}
                    title="No resolved queries yet"
                    description="Answered questions will show up here."
                  />
                ) : (
                  resolvedQueries.slice(0, 10).map((query) => (
                    <div key={query.id} className="p-4 rounded-lg border bg-secondary/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{query.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {query.farmer?.full_name || 'Unknown farmer'}
                            {query.farmer?.email ? ` • ${query.farmer.email}` : ''}
                          </p>
                        </div>
                        {getStatusBadge(query.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{query.message}</p>
                      {query.admin_response && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs font-medium text-primary mb-1">Your Response:</p>
                          <p className="text-sm">{query.admin_response}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminQueries;
