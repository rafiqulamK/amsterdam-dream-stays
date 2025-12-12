import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface RoomSignProps {
  roomNumber: number;
  title: string;
  icon: LucideIcon;
  className?: string;
}

const RoomSign = ({ roomNumber, title, icon: Icon, className }: RoomSignProps) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Hanging sign effect */}
      <div className="relative">
        {/* Chain links */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-0.5 h-2 bg-primary/40" />
          <div className="w-2 h-2 rounded-full border border-primary/40" />
          <div className="w-0.5 h-2 bg-primary/40" />
        </div>
        
        {/* Sign plate */}
        <div 
          className={cn(
            'relative px-4 py-2 rounded-lg',
            'bg-gradient-to-br from-primary/20 to-primary/10',
            'border border-primary/30',
            'shadow-lg',
            'animate-swing'
          )}
          style={{
            transformOrigin: 'top center',
          }}
        >
          {/* Room number badge */}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">{roomNumber}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Icon className="w-4 h-4 text-primary" aria-label={title} />
            </div>
            <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
              {title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSign;