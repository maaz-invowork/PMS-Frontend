import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../lib/api';
import { Project } from '../types';
import { Navbar } from '../components/Navbar';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { ManageMembersModal } from '../components/modals/ManageMembersModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FolderPlus, Search, Loader2, FolderKanban } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<Project | null>(null);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: ({ projectId, userIds }: { projectId: number; userIds: number[] }) =>
      projectsApi.addMembers(projectId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId, userId }: { projectId: number; userId: number }) =>
      projectsApi.removeMembers(projectId, [userId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreateProject = async (title: string, description: string) => {
    await createProjectMutation.mutateAsync({ title, description: description || undefined });
  };

  const handleDeleteProject = (id: number) => {
    setConfirmDeleteProjectId(id);
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenCreateProject={() => setIsCreateOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-400 mb-1">
              <span>Project Dashboard</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              View, track, and manage all active projects across your workspace in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-slate-100 text-sm focus:border-blue-500"
              />
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shrink-0 shadow-lg shadow-blue-600/20"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-400">Loading your project workspaces...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center text-sm">
            Failed to load projects. Please refresh or log in again.
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FolderKanban className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-200">No Projects Found</h3>
              <p className="text-sm text-slate-400">
                {searchQuery
                  ? `No projects match "${searchQuery}".`
                  : "You haven't created or joined any projects yet."}
              </p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Project</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onManageMembers={(proj) => setSelectedProjectForMembers(proj)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProject}
      />

      <ManageMembersModal
        project={selectedProjectForMembers}
        open={!!selectedProjectForMembers}
        onOpenChange={(open) => !open && setSelectedProjectForMembers(null)}
        onAddMembers={async (projId, userIds) => {
          await addMembersMutation.mutateAsync({ projectId: projId, userIds });
          const updated = projects.find((p) => p.id === projId);
          if (updated) setSelectedProjectForMembers({ ...updated });
        }}
        onRemoveMember={async (projId, userId) => {
          await removeMemberMutation.mutateAsync({ projectId: projId, userId });
          const updated = projects.find((p) => p.id === projId);
          if (updated) setSelectedProjectForMembers({ ...updated });
        }}
      />

      <ConfirmModal
        open={confirmDeleteProjectId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteProjectId(null)}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated boards will be removed. This action cannot be undone."
        confirmLabel="Delete Project"
        onConfirm={async () => {
          if (confirmDeleteProjectId !== null) {
            await deleteProjectMutation.mutateAsync(confirmDeleteProjectId);
          }
        }}
      />
    </div>
  );
};
