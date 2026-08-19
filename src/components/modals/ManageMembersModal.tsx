import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Project, UserMinimal } from '../../types';
import { Loader2, Users, Search, Check, UserMinus } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { api, projectsApi } from '../../lib/api';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [users, setUsers] = useState<UserMinimal[]>([]);
  const [localMembers, setLocalMembers] = useState<UserMinimal[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && project) {
      setLocalMembers(project.members || []);
    }
  }, [open, project?.id]);

  // Fetch assignable members automatically when the modal opens
  useEffect(() => {
    if (!open) {
      // Reset state on close
      setSelectedUserIds([]);
      setSearchQuery('');
      setError('');
      return;
    }

    const fetchAssignableUsers = async () => {

      setFetchingUsers(true);
      try {
        const response = await projectsApi.fetchUsers();
        setUsers(response);
      } catch (err: any) {
        console.error('Failed to fetch available users:', err);
        setError('Failed to load user list.');
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchAssignableUsers();
  }, [open]);

  const usersToFilter = users;

  // Extract existing member IDs for fast lookup using localMembers state
  const existingMemberIds = useMemo(() => {
    const ids = new Set<number>();
    if (!project) return ids;

    if (project.owner?.id) ids.add(project.owner.id);
    localMembers.forEach((m) => ids.add(m.id));
    return ids;
  }, [project, localMembers]);

  // Filter out users who are already members, then apply text search filter
  const availableUsers = useMemo(() => {
    if (!project) return [];

    return usersToFilter
      .filter((user) => !existingMemberIds.has(user.id))
      .filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
          user.full_name?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        );
      });
  }, [usersToFilter, existingMemberIds, searchQuery, project]);

  if (!project) return null;

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddSelected = async () => {
    if (selectedUserIds.length === 0) return;
    setError('');
    setLoading(true);

    try {
      await onAddMembers(project.id, selectedUserIds);

      // Update local members state immediately
      const addedUsers = usersToFilter.filter((user) => selectedUserIds.includes(user.id));
      setLocalMembers((prev) => [...prev, ...addedUsers]);

      setSelectedUserIds([]);
      setSearchQuery('');
    } catch (err: any) {
      console.error('Failed to add members:', err);
      setError(err.response?.data?.detail || 'Failed to add members.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: number) => {
    setError('');
    setLoading(true);
    try {
      await onRemoveMember(project.id, userId);

      // Update local members state immediately
      setLocalMembers((prev) => prev.filter((m) => m.id !== userId));
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
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl font-bold">Manage Project Members</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Select users to invite or remove members from this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Add Members Section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Add New Members
            </span>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-950/60 border-slate-800 focus:border-blue-500 text-slate-100 placeholder:text-slate-500 text-sm"
              />
            </div>

            {/* Available Users Selection List */}
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-800/60 rounded-lg hbg-slate-950/30">
              {fetchingUsers ? (
                <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  Fetching available members...
                </div>
              ) : availableUsers.length > 0 ? (
                availableUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected
                        ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                        : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-6 h-6 bg-slate-800 text-slate-200 text-[10px]">
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs font-medium">{user.full_name || user.username}</div>
                          <div className="text-[10px] text-slate-500">{user.email}</div>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-700 bg-slate-900'
                          }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                searchQuery && (
                <div className="text-xs text-slate-500 italic text-center py-3 flex justify-center items-center">
                  <p className="text-xs text-slate-500 italic text-center py-3 w-3/4">
                    No matching users found which is not currently a member of this project.
                  </p>
                </div>
                )
              )}
            </div>

            {/* Submit Selection Button */}
            {selectedUserIds.length > 0 && (
              <Button
                onClick={handleAddSelected}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-500/90 text-white font-semibold text-xs h-8 mt-1"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  `Add ${selectedUserIds.length} Selected Member${selectedUserIds.length > 1 ? 's' : ''}`
                )}
              </Button>
            )}
          </div>

          {/* Current Members List */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Members ({localMembers.length})
            </span>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">

              {/* Members */}
              {localMembers.length > 0 ? (
                localMembers
                  .filter((m) => m.id !== project.owner?.id)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-7 h-7 bg-slate-800 text-slate-200 text-xs">
                          <AvatarFallback>{getInitials(m.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">
                            {m.full_name || m.username}
                          </div>
                          <div className="text-[10px] text-slate-400">{m.email}</div>
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
                        <UserMinus className="w-3.5 h-3.5" />
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

      </DialogContent>
    </Dialog>
  );
};