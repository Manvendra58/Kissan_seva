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
import { Leaf, Plus, Edit, Trash2, Loader2, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cropTypes } from '@/data/indianStates';
import { getDefaultCropData } from '@/data/defaultCrops';

interface Crop {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  soil_preparation: string | null;
  fertilizers: string | null;
  pesticides: string | null;
  organic_methods: string | null;
  modern_techniques: string | null;
  season: string | null;
}

const AdminCrops = () => {
  const { toast } = useToast();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [soilPreparation, setSoilPreparation] = useState('');
  const [fertilizers, setFertilizers] = useState('');
  const [pesticides, setPesticides] = useState('');
  const [organicMethods, setOrganicMethods] = useState('');
  const [modernTechniques, setModernTechniques] = useState('');
  const [season, setSeason] = useState('');

  const fetchCrops = async () => {
    const { data } = await supabase.from('crops').select('*').order('name');
    const dbCrops = data || [];
    // Merge: always show all 18 crops - use DB data where exists
    const merged = cropTypes.map((name) => {
      const dbMatch = dbCrops.find((c: Crop) => c.name.toLowerCase() === name.toLowerCase());
      return dbMatch ? { ...dbMatch } : { ...getDefaultCropData(name), id: `placeholder-${name}` };
    });
    setCrops(merged);
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const resetForm = () => {
    setName('');
    setCategory('');
    setDescription('');
    setSoilPreparation('');
    setFertilizers('');
    setPesticides('');
    setOrganicMethods('');
    setModernTechniques('');
    setSeason('');
    setEditingCrop(null);
  };

  const openEditDialog = (crop: Crop) => {
    setEditingCrop(crop);
    setName(crop.name);
    setCategory(crop.category || '');
    setDescription(crop.description || '');
    setSoilPreparation(crop.soil_preparation || '');
    setFertilizers(crop.fertilizers || '');
    setPesticides(crop.pesticides || '');
    setOrganicMethods(crop.organic_methods || '');
    setModernTechniques(crop.modern_techniques || '');
    setSeason(crop.season || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const cropData = {
      name,
      category,
      description,
      soil_preparation: soilPreparation,
      fertilizers,
      pesticides,
      organic_methods: organicMethods,
      modern_techniques: modernTechniques,
      season,
    };

    const isPlaceholder = editingCrop?.id?.toString().startsWith('placeholder-');
    let error;
    if (editingCrop && !isPlaceholder) {
      ({ error } = await supabase.from('crops').update(cropData).eq('id', editingCrop.id));
    } else {
      ({ error } = await supabase.from('crops').insert(cropData));
    }

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Crop ${editingCrop ? 'updated' : 'added'} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchCrops();
    }
  };

  const handleDelete = async (id: string) => {
    if (id.toString().startsWith('placeholder-')) return;
    if (!confirm('Are you sure you want to delete this crop?')) return;

    const { error } = await supabase.from('crops').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Crop removed successfully" });
      fetchCrops();
    }
  };

  const handleAddAllCrops = async () => {
    const existingNames = new Set(crops.map((c) => c.name.toLowerCase()));
    const toAdd = cropTypes.filter((name) => !existingNames.has(name.toLowerCase()));
    if (toAdd.length === 0) {
      toast({ title: "Already added", description: "All crop types are already in the database.", variant: "destructive" });
      return;
    }
    if (!confirm(`Add ${toAdd.length} crops (${toAdd.join(', ')})?`)) return;

    setIsLoading(true);
    const cropData = toAdd.map((name) => ({
      name,
      category: name,
      description: `${name} cultivation guide. Add soil preparation, fertilizers, and pest control details.`,
      season: name === 'Rice' || name === 'Maize' || name === 'Cotton' || name === 'Soybean' ? 'Kharif' : name === 'Wheat' || name === 'Groundnut' || name === 'Pulses' ? 'Rabi' : null,
    }));

    const { error } = await supabase.from('crops').insert(cropData);
    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Added ${toAdd.length} crops` });
      fetchCrops();
    }
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Leaf className="w-8 h-8 text-primary" />
              Manage Crops
            </h1>
            <p className="text-muted-foreground mt-1">Add and manage crop information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleAddAllCrops} disabled={isLoading}>
              <Database className="w-4 h-4" />
              Add All Crops
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Add Crop</Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">{editingCrop ? 'Edit' : 'Add'} Crop</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Crop Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Cereals, Cash Crops" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g., Kharif, Rabi" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Soil Preparation</Label>
                  <Textarea value={soilPreparation} onChange={(e) => setSoilPreparation(e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Fertilizers & Nutrients</Label>
                  <Textarea value={fertilizers} onChange={(e) => setFertilizers(e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Pest & Disease Control</Label>
                  <Textarea value={pesticides} onChange={(e) => setPesticides(e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Organic Methods</Label>
                  <Textarea value={organicMethods} onChange={(e) => setOrganicMethods(e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Modern Techniques</Label>
                  <Textarea value={modernTechniques} onChange={(e) => setModernTechniques(e.target.value)} rows={2} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingCrop ? 'Update' : 'Add'} Crop
                </Button>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="card-garden">
          <CardHeader>
            <CardTitle className="font-display">All Crops ({crops.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crops.map((crop) => (
                <div key={crop.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{crop.name}</h3>
                      <div className="flex gap-2 mt-1">
                        {crop.category && <Badge variant="secondary">{crop.category}</Badge>}
                        {crop.season && <Badge className="badge-success">{crop.season}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(crop)} title={crop.id.toString().startsWith('placeholder-') ? 'Add details' : 'Edit'}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!crop.id.toString().startsWith('placeholder-') && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(crop.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
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

export default AdminCrops;
