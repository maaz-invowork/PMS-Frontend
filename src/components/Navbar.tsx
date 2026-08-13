import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Plus, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavbarProps {
  onOpenCreateProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
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
      <div className="px-4 pr-8 h-16 flex items-center justify-between">
        <div>
          <img src="/logo.png" className="w-30" alt="Logo" />
        </div>

        <div className="flex items-center gap-4">

          {user && (
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full transition-transform hover:scale-105 cursor-pointer">
                  <Avatar className="w-9 h-9 border border-blue-500/30 bg-slate-800">
                    <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-blue-400 font-semibold text-xs">
                      {getInitials(user.full_name || user.username)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-100 p-2 shadow-2xl">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-100 truncate">{user.full_name}</p>
                          {user.role && (
                            <Badge
                              variant={user.role.name === 'admin' ? 'destructive' : 'secondary'}
                              className="text-[10px] px-1.5 py-0 font-medium uppercase tracking-wider shrink-0"
                            >
                              {user.role.name === 'admin' && <Shield className="w-2.5 h-2.5 inline" />}
                              <span className="capitalize">{user.role.name}</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                        {user.email && <p className="text-[11px] text-slate-500 truncate">{user.email}</p>}
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-slate-800 my-1" />

                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium text-red-500 hover:text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
