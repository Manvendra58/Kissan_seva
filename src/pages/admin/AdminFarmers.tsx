import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, MapPin, Wheat } from 'lucide-react';

interface Farmer {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  mobile: string | null;
  state: string | null;
  district: string | null;
  crop_type: string | null;
  created_at: string;
}

const AdminFarmers = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFarmers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setFarmers(data);
    };

    fetchFarmers();
  }, []);

  const filteredFarmers = farmers.filter(farmer =>
    farmer.full_name.toLowerCase().includes(search.toLowerCase()) ||
    farmer.email?.toLowerCase().includes(search.toLowerCase()) ||
    farmer.district?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Manage Farmers
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage registered farmers
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search farmers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card className="card-garden">
          <CardHeader>
            <CardTitle className="font-display">
              Registered Farmers ({filteredFarmers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold">Location</th>
                    <th className="text-left py-3 px-4 font-semibold">Crop</th>
                    <th className="text-left py-3 px-4 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium">{farmer.full_name}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm">{farmer.email}</p>
                        <p className="text-xs text-muted-foreground">{farmer.mobile}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-sm">
                            {[farmer.district, farmer.state].filter(Boolean).join(', ') || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {farmer.crop_type ? (
                          <Badge className="badge-success">
                            <Wheat className="w-3 h-3 mr-1" />
                            {farmer.crop_type}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(farmer.created_at).toLocaleDateString()}
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

export default AdminFarmers;
