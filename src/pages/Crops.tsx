import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Leaf, Search, Sprout, Sun, Droplets } from 'lucide-react';
import { getAllDefaultCrops } from '@/data/defaultCrops';

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
  image_url: string | null;
}

const CropsPage = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      const { data } = await supabase
        .from('crops')
        .select('*')
        .order('name');

      const dbCrops = data || [];
      const defaults = getAllDefaultCrops();
      // Merge: use DB data where exists, else use default for all 18 crops
      const merged = defaults.map((d) => {
        const dbMatch = dbCrops.find((c: Crop) => c.name.toLowerCase() === d.name.toLowerCase());
        return dbMatch ? { ...dbMatch } : d;
      });
      setCrops(merged);
      setIsLoading(false);
    };

    fetchCrops();
  }, []);

  const filteredCrops = crops.filter(crop =>
    crop.name.toLowerCase().includes(search.toLowerCase()) ||
    crop.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Leaf className="w-8 h-8 text-primary" />
              Agricultural Information
            </h1>
            <p className="text-muted-foreground mt-1">
              Learn about different crops, soil preparation, and farming techniques
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search crops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {selectedCrop ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedCrop(null)}
              className="text-primary hover:underline flex items-center gap-1"
            >
              ← Back to all crops
            </button>
            
            <Card className="card-garden">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="icon-container w-16 h-16">
                    <Sprout className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-display">{selectedCrop.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      {selectedCrop.category && (
                        <Badge variant="secondary">{selectedCrop.category}</Badge>
                      )}
                      {selectedCrop.season && (
                        <Badge className="badge-success">{selectedCrop.season}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-4 text-base">
                  {selectedCrop.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedCrop.soil_preparation && (
                  <div className="p-4 rounded-lg bg-secondary">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-primary" />
                      Soil Preparation
                    </h3>
                    <p className="text-muted-foreground">{selectedCrop.soil_preparation}</p>
                  </div>
                )}
                
                {selectedCrop.fertilizers && (
                  <div className="p-4 rounded-lg bg-secondary">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Sprout className="w-5 h-5 text-primary" />
                      Fertilizers & Nutrients
                    </h3>
                    <p className="text-muted-foreground">{selectedCrop.fertilizers}</p>
                  </div>
                )}

                {selectedCrop.pesticides && (
                  <div className="p-4 rounded-lg bg-secondary">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      🛡️ Pest & Disease Control
                    </h3>
                    <p className="text-muted-foreground">{selectedCrop.pesticides}</p>
                  </div>
                )}

                {selectedCrop.organic_methods && (
                  <div className="alert-success">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      🌿 Organic Farming Methods
                    </h3>
                    <p className="text-muted-foreground">{selectedCrop.organic_methods}</p>
                  </div>
                )}

                {selectedCrop.modern_techniques && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Sun className="w-5 h-5 text-accent" />
                      Modern Techniques
                    </h3>
                    <p className="text-muted-foreground">{selectedCrop.modern_techniques}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrops.map((crop) => (
              <Card
                key={crop.id}
                className="card-garden cursor-pointer"
                onClick={() => setSelectedCrop(crop)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="icon-container">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        {crop.category && (
                          <Badge variant="secondary" className="text-xs">{crop.category}</Badge>
                        )}
                        {crop.season && (
                          <Badge className="badge-success text-xs">{crop.season}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {crop.description || 'Click to view detailed information about this crop.'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CropsPage;
