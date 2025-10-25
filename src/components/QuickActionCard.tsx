import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
}

const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  onClick,
  variant = 'default' 
}: QuickActionCardProps) => {
  return (
    <Card className="hover:shadow-soft transition-all duration-200 hover:scale-105 cursor-pointer" onClick={onClick}>
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="p-3 rounded-full bg-secondary text-primary">
            {icon}
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <Button variant={variant} className="w-full">
          {title}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;