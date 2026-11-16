import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
  <div className="py-12 text-center px-4">
    <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-60" />
    <p className="font-medium text-foreground">{title}</p>
    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{description}</p>
  </div>
);
