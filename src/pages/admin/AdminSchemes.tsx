import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  description: string | null;
  eligibility: string | null;
  benefits: string | null;
  application_process: string | null;
  deadline: string | null;
  is_active: boolean;
}

const AdminSchemes = () => {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [benefits, setBenefits] = useState('');
  const [applicationProcess, setApplicationProcess] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchSchemes = async () => {
    const { data } = await supabase.from('schemes').select('*').order('created_at', { ascending: false });
    if (data) setSchemes(data);
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEligibility('');
    setBenefits('');
    setApplicationProcess('');
    setDeadline('');
    setEditingScheme(null);
  };

  const openEditDialog = (scheme: Scheme) => {
    setEditingScheme(scheme);
    setName(scheme.name);
    setDescription(scheme.description || '');
    setEligibility(scheme.eligibility || '');
    setBenefits(scheme.benefits || '');
    setApplicationProcess(scheme.application_process || '');
    setDeadline(scheme.deadline || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const schemeData = {
      name,
      description,
      eligibility,
      benefits,
      application_process: applicationProcess,
      deadline: deadline || null,
    };

    let error;
    if (editingScheme) {
      ({ error } = await supabase.from('schemes').update(schemeData).eq('id', editingScheme.id));
    } else {
      ({ error } = await supabase.from('schemes').insert(schemeData));
    }

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Scheme ${editingScheme ? 'updated' : 'added'} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchSchemes();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('schemes').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchSchemes(); }
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Building2 className="w-8 h-8 text-accent" />
              Manage Schemes
            </h1>
            <p className="text-muted-foreground mt-1">Add and manage government schemes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Scheme</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editingScheme ? 'Edit' : 'Add'} Scheme</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Scheme Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Eligibility Criteria</Label>
                  <Textarea value={eligibility} onChange={(e) => setEligibility(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Benefits</Label>
                  <Textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Application Process</Label>
                  <Textarea value={applicationProcess} onChange={(e) => setApplicationProcess(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Deadline (Optional)</Label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingScheme ? 'Update' : 'Add'} Scheme
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-garden">
          <CardHeader>
            <CardTitle className="font-display">All Schemes ({schemes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schemes.map((scheme) => (
                <div key={scheme.id} className="p-4 rounded-lg border bg-card flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{scheme.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{scheme.description}</p>
                    {scheme.deadline && (
                      <Badge className="badge-warning mt-2">Deadline: {new Date(scheme.deadline).toLocaleDateString()}</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(scheme)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(scheme.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSchemes;
