import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ArrowRight, MoreVertical, Trash2, Users, Folder } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => void;
  onManageMembers?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onManageMembers }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // console.log(project);
  const isOwnerOrAdmin =
    user?.role?.name === 'admin' || user?.id === project.owner?.id;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleOpenBoard = () => {
    if (project.boards && project.boards.length > 0) {
      navigate(`/projects/${project.id}/boards/${project.boards[0].id}`);
    } else {
      navigate(`/projects/${project.id}`);
    }
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
    <Card className="group relative border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >

      <div>
        <CardHeader className="pt-2 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg pt-1 font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {project.title}
                </CardTitle>
              </div>
            </div>

            {isOwnerOrAdmin && (onDelete || onManageMembers) && (
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  className="text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg h-8 w-8 transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-9 z-50 min-w-[180px] rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-md shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onManageMembers && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onManageMembers(project);
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-blue-400 hover:bg-slate-800/80 transition-colors"
                      >
                        <Users className="w-4 h-4 text-blue-400" />
                        Manage Members
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(project.id);
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        Delete Project
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <CardDescription className="text-sm text-slate-400 line-clamp-2 mt-3 min-h-[2.5rem]">
            {project.description || 'No description provided for this project.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-2 space-y-4">

          {/* Member Avatars */}
          <div className="flex items-center justify-between">
            <div className="flex items-center -space-x-2 overflow-hidden">
              {project.members?.slice(0, 3).map((m) => (
                <Avatar key={m.id} className="w-7 h-7 border-2 border-slate-900 bg-slate-800 text-slate-200 text-[10px]" title={m.full_name}>
                  <AvatarFallback>{getInitials(m.full_name)}</AvatarFallback>
                </Avatar>
              ))}
              {project.members && project.members.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-semibold text-slate-400">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-blue-300 font-semibold flex items-center gap-1">
                Owner:
                <span className='text-slate-200 text-xs font-light'>{project.owner?.full_name}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex justify-center items-center pt-3 pb-4 bg-transparent border-t border-slate-800/70">
        <Button
          onClick={handleOpenBoard}
          className="w-1/2 py-4 bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition-all font-medium flex items-center justify-center gap-2 group/btn shadow-md"
        >
          <span>Open Project</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};
