import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PriorityLevel, Task, UserMinimal } from '../../types';
import { Loader2, Trash2, Edit3, Calendar, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  members: UserMinimal[];
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    taskId: number,
    data: {
      title?: string;
      description?: string;
      priority?: PriorityLevel;
      due_date?: string;
      assignee_id?: number | null;
    }
  ) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  open,
  members,
  onOpenChange,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('unassigned');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setAssigneeId(task.assignee ? task.assignee.id.toString() : 'unassigned');
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignee_id: assigneeId !== 'unassigned' ? Number(assigneeId) : null,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(task.id);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  priority === 'urgent'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : priority === 'high'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : priority === 'medium'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                {priority} priority
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-slate-400 hover:text-blue-400 hover:bg-slate-800"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold mt-2">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-950/80 border-slate-700 text-slate-100 text-xl font-bold"
              />
            ) : (
              task.title
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Created by {task.creator?.full_name || task.creator?.username || 'Unknown'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3 border-t border-b border-slate-800/80 my-2">
          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Description
            </label>
            {isEditing ? (
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <p className="text-sm text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 min-h-[4rem] whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
            {/* Priority */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Priority Level</span>
              {isEditing ? (
                <Select value={priority} onValueChange={(val) => setPriority(val as PriorityLevel)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-semibold capitalize text-slate-200">{task.priority || 'medium'}</div>
              )}
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400">Assigned To</span>
              {isEditing ? (
                <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val || 'unassigned')}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.full_name || m.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span>{task.assignee?.full_name || task.assignee?.username || 'Unassigned'}</span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1 col-span-1 sm:col-span-2">
              <span className="text-xs font-medium text-slate-400">Due Date</span>
              {isEditing ? (
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-slate-100 h-9"
                />
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="bg-transparent border-0">
          {isEditing && (
            <Button
              onClick={handleSave}
              disabled={loading || !title.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <ConfirmModal
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
};
