import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Search, Calendar, ExternalLink, Loader2 } from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  description: string | null;
  eligibility: string | null;
  benefits: string | null;
  application_process: string | null;
  deadline: string | null;
  pdf_url: string | null;
  is_active: boolean;
}

const SchemesPage = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [search, setSearch] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('schemes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setSchemes(data && data.length > 0 ? data : []);
      setLoading(false);
    };

    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter(
    (scheme) =>
      scheme.name.toLowerCase().includes(search.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Building2 className="w-8 h-8 text-accent" />
              Government Schemes
            </h1>
            <p className="text-muted-foreground mt-1">
              Explore and apply for agricultural schemes and subsidies
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : selectedScheme ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedScheme(null)}
              className="text-primary hover:underline flex items-center gap-1"
            >
              ← Back to all schemes
            </button>

            <Card className="card-garden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display">{selectedScheme.name}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {selectedScheme.description}
                    </CardDescription>
                  </div>
                  {selectedScheme.deadline && (
                    <Badge className="badge-warning flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline: {new Date(selectedScheme.deadline).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedScheme.eligibility && (
                  <div className="p-4 rounded-lg bg-secondary">
                    <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedScheme.eligibility}
                    </p>
                  </div>
                )}

                {selectedScheme.benefits && (
                  <div className="alert-success">
                    <h3 className="font-semibold mb-2">Benefits</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedScheme.benefits}
                    </p>
                  </div>
                )}

                {selectedScheme.application_process && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-2">How to Apply</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedScheme.application_process}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedScheme.pdf_url && (
                    <a href={selectedScheme.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2 bg-primary hover:bg-primary/90">
                        <ExternalLink className="w-4 h-4" />
                        Apply Now on Official Website
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : schemes.length === 0 ? (
          <Card className="card-garden">
            <EmptyState
              icon={Building2}
              title="No schemes published yet"
              description="Government schemes will appear here once an admin adds them."
            />
          </Card>
        ) : filteredSchemes.length === 0 ? (
          <Card className="card-garden">
            <EmptyState
              icon={Search}
              title="No matching schemes"
              description="Try a different search term."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="card-garden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight">{scheme.name}</CardTitle>
                    {scheme.deadline && (
                      <Badge className="badge-warning text-xs shrink-0">
                        {new Date(scheme.deadline).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-3 mt-2">
                    {scheme.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scheme.benefits && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground">Benefits: </span>
                      {scheme.benefits}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedScheme(scheme)}
                    >
                      View Details
                    </Button>
                    {scheme.pdf_url && (
                      <a
                        href={scheme.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" className="gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Apply Now
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SchemesPage;
