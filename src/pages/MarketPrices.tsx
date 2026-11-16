import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmptyState } from '@/components/EmptyState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Search, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cropTypes } from '@/data/indianStates';

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

const MarketPricesPage = () => {
  const { profile } = useAuth();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [showAllPrices, setShowAllPrices] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('market_prices')
        .select('*')
        .order('price_date', { ascending: false });

      setPrices(data && data.length > 0 ? data : []);
      setLoading(false);
    };

    fetchPrices();
  }, []);

  const filteredPrices = prices.filter((price) => {
    const matchesSearch =
      price.crop_name.toLowerCase().includes(search.toLowerCase()) ||
      price.market_name?.toLowerCase().includes(search.toLowerCase()) ||
      price.district?.toLowerCase().includes(search.toLowerCase());
    const matchesCrop = selectedCrop === 'all' || price.crop_name === selectedCrop;
    return matchesSearch && matchesCrop;
  });

  const uniqueCrops = [...new Set([...cropTypes, ...prices.map((p) => p.crop_name)])].sort();
  const userCropPrices = prices.filter((p) => p.crop_name === profile?.crop_type);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Market Prices
            </h1>
            <p className="text-muted-foreground mt-1">
              Mandi rates per quintal
              {profile?.district ? ` near ${profile.district}` : ' across India'}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-full md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {uniqueCrops.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : prices.length === 0 ? (
          <Card className="card-garden">
            <EmptyState
              icon={TrendingUp}
              title="No market prices yet"
              description="Prices will appear here once an admin publishes mandi rates. Nothing is invented or randomized."
            />
          </Card>
        ) : (
          <>
            {profile?.crop_type && userCropPrices.length > 0 && (
              <Card className="card-garden border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    Your Crop: {profile.crop_type}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userCropPrices.slice(0, 3).map((price) => (
                      <div key={price.id} className="p-4 rounded-lg bg-card border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{price.market_name}</p>
                            <p className="text-2xl font-bold text-primary">
                              ₹{Number(price.price_per_quintal).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">per quintal</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="card-garden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display">All Market Prices</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setShowAllPrices(!showAllPrices)}
                >
                  {showAllPrices ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      View All ({filteredPrices.length}) <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {filteredPrices.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="No matching prices"
                    description="Try a different search or crop filter."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Crop</th>
                          <th className="text-left py-3 px-4 font-semibold">Market</th>
                          <th className="text-left py-3 px-4 font-semibold">Location</th>
                          <th className="text-right py-3 px-4 font-semibold">Price/Quintal</th>
                          <th className="text-right py-3 px-4 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showAllPrices
                          ? filteredPrices
                          : filteredPrices.slice(0, INITIAL_TABLE_ROWS)
                        ).map((price) => (
                          <tr
                            key={price.id}
                            className="border-b hover:bg-secondary/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{price.crop_name}</span>
                                {price.crop_name === profile?.crop_type && (
                                  <Badge className="badge-success text-xs">Your Crop</Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {price.market_name || '-'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {[price.district, price.state].filter(Boolean).join(', ') ||
                                'Local Mandi'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-bold text-primary">
                                ₹{Number(price.price_per_quintal).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-muted-foreground text-sm">
                              {new Date(price.price_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketPricesPage;
