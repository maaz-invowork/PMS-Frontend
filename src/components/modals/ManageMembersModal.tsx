import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Project, UserMinimal } from '../../types';
import { Loader2, UserPlus, Users, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface ManageMembersModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMembers: (projectId: number, userIds: number[]) => Promise<void>;
  onRemoveMember: (projectId: number, userId: number) => Promise<void>;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  project,
  open,
  onOpenChange,
  onAddMembers,
  onRemoveMember,
}) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!project) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ids = userIdInput
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);

    if (ids.length === 0) {
      setError('Please enter at least one valid numeric User ID.');
      return;
    }

    setLoading(true);
    try {
      await onAddMembers(project.id, ids);
      setUserIdInput('');
    } catch (err: any) {
      console.error('Failed to add members:', err);
      setError(err.response?.data?.detail || 'Failed to add member. Ensure user ID exists.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: number) => {
    setLoading(true);
    try {
      await onRemoveMember(project.id, userId);
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      setError(err.response?.data?.detail || 'Failed to remove member.');
    } finally {
      setLoading(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold">Manage Project Members</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Add team members by their User ID to collaborate on project boards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Add member form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              type="text"
              placeholder="User ID (e.g. 2 or 2, 3)"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="bg-slate-950/60 border-slate-800 focus:border-blue-500 text-slate-100 placeholder:text-slate-500 text-sm"
            />
            <Button
              type="submit"
              disabled={loading || !userIdInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            </Button>
          </form>

          {/* Existing Members List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Members ({(project.members?.length || 0) + 1})
            </span>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {/* Owner */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Avatar className="w-7 h-7 bg-blue-600 text-white font-bold text-xs">
                    <AvatarFallback>{getInitials(project.owner?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {project.owner?.full_name || project.owner?.username}
                    </div>
                    <div className="text-[10px] text-blue-400 font-medium">Project Owner</div>
                  </div>
                </div>
              </div>

              {/* Members */}
              {project.members && project.members.length > 0 ? (
                project.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 bg-slate-800 text-slate-200 text-xs">
                        <AvatarFallback>{getInitials(m.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {m.full_name || m.username}
                        </div>
                        <div className="text-[10px] text-slate-400">ID: {m.id}</div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(m.id)}
                      disabled={loading}
                      className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-7 w-7 rounded-lg"
                      title="Remove member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic text-center py-2">
                  No additional members assigned yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
