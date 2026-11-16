import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';

/** Shows a visible setup warning when Supabase env is incomplete. */
export const ConfigBanner = () => {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="alert"
      className="w-full border-b border-amber-300 bg-amber-50 text-amber-950 px-4 py-3 text-sm"
    >
      <div className="container mx-auto flex gap-3 items-start max-w-3xl">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
        <div>
          <p className="font-semibold">Supabase is not configured</p>
          <p className="mt-1 text-amber-900/90">
            Add <code className="text-xs bg-amber-100 px-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> to
            your <code className="text-xs bg-amber-100 px-1 rounded">.env</code> file (see{' '}
            <code className="text-xs bg-amber-100 px-1 rounded">.env.example</code>), then restart{' '}
            <code className="text-xs bg-amber-100 px-1 rounded">npm run dev</code>. Login and live data
            will not work until this is set.
          </p>
        </div>
      </div>
    </div>
  );
};
