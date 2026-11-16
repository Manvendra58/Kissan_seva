import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Users, Leaf, Building2, TrendingUp, MessageCircle, Bell, AlertTriangle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  totalFarmers: number;
  totalCrops: number;
  totalSchemes: number;
  pendingQueries: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalFarmers: 0,
    totalCrops: 0,
    totalSchemes: 0,
    pendingQueries: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [farmers, crops, schemes, queries] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('crops').select('id', { count: 'exact', head: true }),
        supabase.from('schemes').select('id', { count: 'exact', head: true }),
        supabase.from('farmer_queries').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalFarmers: farmers.count || 0,
        totalCrops: crops.count || 0,
        totalSchemes: schemes.count || 0,
        pendingQueries: queries.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Farmers', value: stats.totalFarmers, icon: Users, href: '/admin/farmers', color: 'text-primary' },
    { label: 'Crops Listed', value: stats.totalCrops, icon: Leaf, href: '/admin/crops', color: 'text-primary' },
    { label: 'Active Schemes', value: stats.totalSchemes, icon: Building2, href: '/admin/schemes', color: 'text-accent' },
    { label: 'Pending Queries', value: stats.pendingQueries, icon: MessageCircle, href: '/admin/queries', color: 'text-destructive' },
  ];

  return (
    <DashboardLayout requireAdmin>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-200/50">
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-teal-800 to-cyan-700 bg-clip-text text-transparent">
            Admin Dashboard 🛡️
          </h1>
          <p className="text-teal-700/80 mt-1">
            Manage farmers, content, and support queries
          </p>
        </div>

        {/* Stats Grid - Funky Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, i) => (
            <Link key={stat.label} to={stat.href}>
              <Card className={cn(
                "stat-card-funky cursor-pointer border-2 overflow-hidden",
                i === 0 && "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/70 hover:border-emerald-500",
                i === 1 && "bg-gradient-to-br from-lime-50 to-green-50 border-lime-200/70 hover:border-lime-500",
                i === 2 && "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/70 hover:border-amber-500",
                i === 3 && "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200/70 hover:border-rose-500"
              )}>
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      i === 0 && "bg-emerald-500/20",
                      i === 1 && "bg-lime-500/20",
                      i === 2 && "bg-amber-500/20",
                      i === 3 && "bg-rose-500/20"
                    )}>
                      <stat.icon className={cn("w-8 h-8", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions - Funky Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-garden overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-teal-200/50">
              <CardTitle className="font-display">⚡ Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">
              <Link to="/admin/crops" className="action-tile-funky p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200/50 hover:border-green-400 hover:shadow-md transition-all text-center">
                <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-bold text-green-800">Manage Crops</p>
                <p className="text-xs text-muted-foreground mt-0.5">🌾 Add & edit</p>
              </Link>
              <Link to="/admin/schemes" className="action-tile-funky p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200/50 hover:border-amber-400 hover:shadow-md transition-all text-center">
                <Building2 className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="font-bold text-amber-800">Manage Schemes</p>
                <p className="text-xs text-muted-foreground mt-0.5">🏛️ Subsidies</p>
              </Link>
              <Link to="/admin/prices" className="action-tile-funky p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-md transition-all text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-blue-800">Update Prices</p>
                <p className="text-xs text-muted-foreground mt-0.5">📈 Mandi rates</p>
              </Link>
              <Link to="/admin/notifications" className="action-tile-funky p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-2 border-violet-200/50 hover:border-violet-400 hover:shadow-md transition-all text-center">
                <Bell className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                <p className="font-bold text-violet-800">Send Alerts</p>
                <p className="text-xs text-muted-foreground mt-0.5">🔔 Push updates</p>
              </Link>
              <Link to="/admin/calendar" className="action-tile-funky p-5 rounded-2xl col-span-2 bg-gradient-to-br from-teal-50 to-green-50 hover:from-teal-100 hover:to-green-100 border-2 border-teal-200/50 hover:border-teal-400 hover:shadow-md transition-all text-center">
                <Calendar className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="font-bold text-teal-800">Farming Calendar</p>
                <p className="text-xs text-muted-foreground mt-0.5">📅 Seasonal events</p>
              </Link>
            </CardContent>
          </Card>

          {stats.pendingQueries > 0 && (
            <Card className="card-garden border-2 border-rose-300/60 overflow-hidden bg-gradient-to-br from-rose-50 to-red-50">
              <CardHeader className="bg-gradient-to-r from-rose-100 to-red-100 border-b border-rose-200/50">
                <CardTitle className="font-display flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="alert-danger">
                  <p className="font-semibold">{stats.pendingQueries} Pending Queries</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Farmers are waiting for responses. Please review and respond.
                  </p>
                  <Link to="/admin/queries" className="inline-block mt-3 text-primary font-medium hover:underline">
                    View Queries →
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
