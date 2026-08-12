import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, LogOut, Shield, User as UserIcon, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

interface NavbarProps {
  onOpenCreateProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateProject }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/projects" className="flex items-center gap-3 group">
              <span className="text-lg uppercase font-semibold tracking-wider text-slate-400">
                PMS
              </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <Link
              to="/projects"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              Projects
            </Link>
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {onOpenCreateProject && (
            <Button
              onClick={onOpenCreateProject}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-600/25 flex items-center gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          )}

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <Avatar className="w-9 h-9 border border-blue-500/30 bg-slate-800">
                <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-blue-400 font-semibold text-xs">
                  {getInitials(user.full_name || user.username)}
                </AvatarFallback>
              </Avatar>

              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">
                    {user.full_name}
                  </span>
                  {user.role && (
                    <Badge
                      variant={user.role.name === 'admin' ? 'destructive' : 'secondary'}
                      className="text-[10px] px-1.5 py-0 font-medium uppercase tracking-wider"
                    >
                      {user.role.name === 'admin' && <Shield className="w-2.5 h-2.5 mr-1 inline" />}
                      {user.role.name}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-slate-400">@{user.username}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log out"
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg ml-1"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
