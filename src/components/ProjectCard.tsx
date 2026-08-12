import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { FolderKanban, Users, Trash2, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: number) => void;
  onManageMembers?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onManageMembers }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwnerOrAdmin =
    user?.role?.name === 'admin' || user?.id === project.owner?.id;

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
    <Card className="group relative border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        <CardHeader className="pt-6 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {project.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Owner: {project.owner?.full_name || project.owner?.username}
                  </span>
                </div>
              </div>
            </div>

            {isOwnerOrAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg h-8 w-8 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <CardDescription className="text-sm text-slate-400 line-clamp-2 mt-3 min-h-[2.5rem]">
            {project.description || 'No description provided for this project.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-b border-slate-800/80 py-2.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>{project.boards?.length || 0} Board(s)</span>
            </div>

            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{(project.members?.length || 0) + 1} Member(s)</span>
            </div>
          </div>

          {/* Member Avatars */}
          <div className="flex items-center justify-between">
            <div className="flex items-center -space-x-2 overflow-hidden">
              <Avatar className="w-7 h-7 border-2 border-slate-900 bg-blue-600 text-white font-bold text-[10px]" title={`Owner: ${project.owner?.full_name}`}>
                <AvatarFallback>{getInitials(project.owner?.full_name)}</AvatarFallback>
              </Avatar>
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

            {isOwnerOrAdmin && onManageMembers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onManageMembers(project)}
                className="text-xs text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 h-7 px-2"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Members
              </Button>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 pb-4">
        <Button
          onClick={handleOpenBoard}
          className="w-full bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white transition-all font-semibold flex items-center justify-center gap-2 group/btn shadow-md"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};
