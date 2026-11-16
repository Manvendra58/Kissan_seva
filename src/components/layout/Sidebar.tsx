import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Leaf,
  Building2,
  TrendingUp,
  Cloud,
  MessageCircle,
  Calendar,
  Settings,
  LogOut,
  Users,
  Bell,
  Shield,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const farmerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Crop Info', href: '/crops', icon: Leaf },
  { label: 'Govt. Schemes', href: '/schemes', icon: Building2 },
  { label: 'Market Prices', href: '/market-prices', icon: TrendingUp },
  { label: 'Weather', href: '/weather', icon: Cloud },
  { label: 'My Queries', href: '/queries', icon: MessageCircle },
  { label: 'Farming Calendar', href: '/calendar', icon: Calendar },
  { label: 'My Profile', href: '/profile', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Farmers', href: '/admin/farmers', icon: Users },
  { label: 'Crops', href: '/admin/crops', icon: Leaf },
  { label: 'Schemes', href: '/admin/schemes', icon: Building2 },
  { label: 'Market Prices', href: '/admin/prices', icon: TrendingUp },
  { label: 'Weather', href: '/admin/weather', icon: Cloud },
  { label: 'Queries', href: '/admin/queries', icon: MessageCircle },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Farming Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'My Profile', href: '/profile', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin, profile } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : farmerNavItems;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarBody = (
    <>
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-2', !isMobile && isCollapsed && 'flex-col')}>
            <img
              src="/logo.png"
              alt="Kisan Seva"
              className="h-11 w-11 object-contain rounded-xl flex-shrink-0 ring-2 ring-white/30"
            />
            {(isMobile || !isCollapsed) && (
              <div>
                <h1 className="font-brand font-bold text-lg drop-shadow-sm">Kisan Seva</h1>
                <p className="text-xs text-white/80 font-medium">
                  {isAdmin ? 'Admin Panel' : 'Farmer Portal'}
                </p>
              </div>
            )}
          </div>
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:bg-white/20 rounded-lg"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-white/30 text-white border-l-4 border-amber-300 shadow-lg backdrop-blur-sm'
                      : 'text-white/90 hover:bg-white/15 hover:text-white hover:translate-x-1'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {(isMobile || !isCollapsed) && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-white/20">
        {(isMobile || !isCollapsed) && profile && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
            <p className="font-semibold text-sm truncate">{profile.full_name}</p>
            <p className="text-xs text-white/80 truncate">
              {isAdmin ? 'Administrator' : profile.crop_type || 'Farmer'}
            </p>
          </div>
        )}

        <div className="space-y-1">
          {isAdmin && (
            <Link
              to="/dashboard"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/15',
                !isMobile && isCollapsed && 'justify-center'
              )}
            >
              <Shield className="w-5 h-5" />
              {(isMobile || !isCollapsed) && <span className="text-sm">Farmer View</span>}
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/90 hover:bg-red-400/30 hover:text-white transition-colors',
              !isMobile && isCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5" />
            {(isMobile || !isCollapsed) && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 py-3 bg-primary text-white shadow-md md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            <span className="font-brand font-bold truncate">Kisan Seva</span>
          </div>
        </div>

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-screen w-72 sidebar-funky text-white flex flex-col transition-transform duration-300 md:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarBody}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 sidebar-funky text-white flex flex-col transition-all duration-300 hidden md:flex',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {sidebarBody}
    </aside>
  );
};
