import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigBanner } from "@/components/ConfigBanner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CropsPage from "./pages/Crops";
import SchemesPage from "./pages/Schemes";
import MarketPricesPage from "./pages/MarketPrices";
import WeatherPage from "./pages/Weather";
import QueriesPage from "./pages/Queries";
import FarmingCalendar from "./pages/FarmingCalendar";
import ProfilePage from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminFarmers from "./pages/admin/AdminFarmers";
import AdminCrops from "./pages/admin/AdminCrops";
import AdminSchemes from "./pages/admin/AdminSchemes";
import AdminPrices from "./pages/admin/AdminPrices";
import AdminWeather from "./pages/admin/AdminWeather";
import AdminQueries from "./pages/admin/AdminQueries";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminCalendar from "./pages/admin/AdminCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConfigBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/crops" element={<ProtectedRoute><CropsPage /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
            <Route path="/market-prices" element={<ProtectedRoute><MarketPricesPage /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/queries" element={<ProtectedRoute><QueriesPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><FarmingCalendar /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/farmers" element={<ProtectedRoute requireAdmin><AdminFarmers /></ProtectedRoute>} />
            <Route path="/admin/crops" element={<ProtectedRoute requireAdmin><AdminCrops /></ProtectedRoute>} />
            <Route path="/admin/schemes" element={<ProtectedRoute requireAdmin><AdminSchemes /></ProtectedRoute>} />
            <Route path="/admin/prices" element={<ProtectedRoute requireAdmin><AdminPrices /></ProtectedRoute>} />
            <Route path="/admin/weather" element={<ProtectedRoute requireAdmin><AdminWeather /></ProtectedRoute>} />
            <Route path="/admin/queries" element={<ProtectedRoute requireAdmin><AdminQueries /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute requireAdmin><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/calendar" element={<ProtectedRoute requireAdmin><AdminCalendar /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
