import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Library, 
  Calendar, 
  Zap, 
  History, 
  Settings,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Workflow Library', href: '/library', icon: Library },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Test Workflow', href: '/test', icon: Zap },
  { name: 'History', href: '/history', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Workflow className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">DJZ-Yesterday</h2>
            <p className="text-xs text-muted-foreground">Workflow Scheduler</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                'text-sm font-medium',
                'hover:bg-primary/10 hover:text-primary',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "text-accent")} />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          v1.0.0 • ComfyUI Integration
        </p>
      </div>
    </aside>
  );
}
