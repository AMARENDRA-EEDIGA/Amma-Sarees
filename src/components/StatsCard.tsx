import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: 'primary' | 'accent' | 'secondary';
}

const StatsCard = ({ title, value, icon, trend, color = 'primary' }: StatsCardProps) => {
  const colorClasses = {
    primary: 'from-primary to-primary-glow text-primary-foreground',
    accent: 'from-accent to-yellow-400 text-accent-foreground',
    secondary: 'from-secondary to-muted text-secondary-foreground',
  };

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-warm transition-shadow">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <p className="text-xs opacity-75 mt-1">{trend}</p>
              )}
            </div>
            <div className="opacity-80">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;