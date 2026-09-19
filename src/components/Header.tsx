import { Plus, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  onOpenFilters: () => void;
  onSubmitCase: () => void;
  caseCount: number;
}

const Header = ({ onOpenFilters, onSubmitCase, caseCount }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-900/95 via-red-950/95 to-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-xl">
      <div className="flex items-center justify-between p-3 sm:p-4">
        {/* Back button and Logo */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Mobile Sidebar Hamburger */}
          <div className="md:hidden mr-2">
            <SidebarTrigger className="h-10 w-10 bg-white/90 text-gray-700 rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200">
              <span className="sr-only">Open Sidebar</span>
            </SidebarTrigger>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/10 transition-all mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
              <img src="/logo.svg" alt="PoliceBrutalityTracker" className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">PoliceBrutalityTracker</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Public data, visualized</p>
            </div>
          </div>
        </div>

        {/* Case counter */}
        <div className="hidden sm:flex items-center mr-4">
          <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30 px-3 py-1">
            <MapPin className="w-3 h-3 mr-1" />
            {caseCount} cases
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={onSubmitCase}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Report Case</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile subtitle and counter */}
      <div className="sm:hidden px-3 pb-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">Kenya's Police Brutality Tracker</span>
        <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30 text-xs px-2 py-1">
          <MapPin className="w-3 h-3 mr-1" />
          {caseCount}
        </Badge>
      </div>
    </div>
  );
};

export default Header;
