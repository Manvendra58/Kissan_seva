import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Plus, Edit, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { indianStates, cropTypes } from '@/data/indianStates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MarketPrice {
  id: string;
  crop_name: string;
  market_name: string | null;
  state: string | null;
  district: string | null;
  price_per_quintal: number;
  price_date: string;
}

const INITIAL_TABLE_ROWS = 5;

const AdminPrices = () => {
  const { toast } = useToast();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [cropOptions, setCropOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<MarketPrice | null>(null);
  const [showAllPrices, setShowAllPrices] = useState(false);
  
  const [cropName, setCropName] = useState('');
  const [marketName, setMarketName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pricePerQuintal, setPricePerQuintal] = useState('');
  const [priceDate, setPriceDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchCropOptions = async () => {
    const { data: cropsData } = await supabase.from('crops').select('name');
    const cropNames = cropsData?.map((c) => c.name) || [];
    const merged = [...new Set([...cropNames, ...cropTypes])].sort();
    setCropOptions(merged);
  };

  const fetchPrices = async () => {
    const { data } = await supabase.from('market_prices').select('*').order('price_date', { ascending: false });
    if (data) setPrices(data);
  };

  useEffect(() => {
    fetchPrices();
    fetchCropOptions();
  }, []);

  const resetForm = () => {
    setCropName('');
    setMarketName('');
    setState('');
    setDistrict('');
    setPricePerQuintal('');
    setPriceDate(new Date().toISOString().split('T')[0]);
    setEditingPrice(null);
  };

  const openEditDialog = (price: MarketPrice) => {
    setEditingPrice(price);
    setCropName(price.crop_name);
    setMarketName(price.market_name || '');
    setState(price.state || '');
    setDistrict(price.district || '');
    setPricePerQuintal(price.price_per_quintal.toString());
    setPriceDate(price.price_date);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const priceData = {
      crop_name: cropName,
      market_name: marketName,
      state,
      district,
      price_per_quintal: parseFloat(pricePerQuintal),
      price_date: priceDate,
    };

    let error;
    if (editingPrice) {
      ({ error } = await supabase.from('market_prices').update(priceData).eq('id', editingPrice.id));
    } else {
      ({ error } = await supabase.from('market_prices').insert(priceData));
    }

    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Price ${editingPrice ? 'updated' : 'added'} successfully` });
      resetForm();
      setIsDialogOpen(false);
      fetchPrices();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('market_prices').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchPrices(); }
  };

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Market Prices
            </h1>
            <p className="text-muted-foreground mt-1">Manage mandi rates (₹/quintal) — add, edit & delete price entries</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Price</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editingPrice ? 'Edit' : 'Add'} Price</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Crop</Label>
                  <Select value={cropName} onValueChange={setCropName}>
                    <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                    <SelectContent>
                      {cropOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Market Name</Label>
                  <Input value={marketName} onChange={(e) => setMarketName(e.target.value)} placeholder="e.g., APMC Mandi" />
                </div>
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
                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹/Quintal)</Label>
                    <Input type="number" value={pricePerQuintal} onChange={(e) => setPricePerQuintal(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={priceDate} onChange={(e) => setPriceDate(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingPrice ? 'Update' : 'Add'} Price
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="card-garden">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display">Price Records ({prices.length})</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Mandi prices per quintal — visible to farmers on dashboard</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 shrink-0"
              onClick={() => setShowAllPrices(!showAllPrices)}
            >
              {showAllPrices ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>View All ({prices.length}) <ChevronDown className="w-4 h-4" /></>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Crop</th>
                    <th className="text-left py-3 px-4 font-semibold">Market</th>
                    <th className="text-left py-3 px-4 font-semibold">Location</th>
                    <th className="text-right py-3 px-4 font-semibold">Price/Q</th>
                    <th className="text-right py-3 px-4 font-semibold">Date</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllPrices ? prices : prices.slice(0, INITIAL_TABLE_ROWS)).map((price) => (
                    <tr key={price.id} className="border-b hover:bg-secondary/50">
                      <td className="py-3 px-4 font-medium">{price.crop_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{price.market_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{[price.district, price.state].filter(Boolean).join(', ') || '—'}</td>
                      <td className="py-3 px-4 text-right font-bold text-primary">₹{Number(price.price_per_quintal).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm">{new Date(price.price_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(price)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(price.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPrices;
