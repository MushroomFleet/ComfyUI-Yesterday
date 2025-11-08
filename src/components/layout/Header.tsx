import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useScheduler } from '@/hooks';
import { useState, useEffect } from 'react';
import { ComfyUIService } from '@/services/comfyui.service';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/library': 'Workflow Library',
  '/calendar': 'Calendar',
  '/test': 'Test Workflow',
  '/history': 'History',
  '/settings': 'Settings',
};

export function Header() {
  const location = useLocation();
  const { isRunning } = useScheduler();
  const [isConnected, setIsConnected] = useState(false);

  // Check ComfyUI connection
  useEffect(() => {
    const comfyService = new ComfyUIService();
    const checkConnection = async () => {
      const healthy = await comfyService.healthCheck();
      setIsConnected(healthy);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const currentRoute = routeNames[location.pathname] || 'Page';

  return (
    <header className="h-16 bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          {location.pathname !== '/' && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{currentRoute}</span>
            </>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Scheduler Status */}
          <Badge
            variant={isRunning ? 'default' : 'secondary'}
            className={isRunning ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            Scheduler {isRunning ? 'Active' : 'Inactive'}
          </Badge>

          {/* ComfyUI Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
