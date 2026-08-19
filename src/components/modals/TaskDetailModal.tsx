import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PriorityLevel, Task, UserMinimal } from '../../types';
import { Loader2, Trash2, Edit3, Calendar, User as UserIcon, CheckCircle2, CircleUser } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { EditTaskModal } from './EditTaskModal';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  members?: UserMinimal[];
  columns?: { id: number; name: string }[];
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    taskId: number,
    data: {
      title?: string;
      description?: string;
      priority?: PriorityLevel;
      due_date?: string;
      column_id?: number;
      assignee_id?: number;
    }
  ) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  open,
  members,
  columns,
  onOpenChange,
  onUpdate,
  onDelete,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(task.id);
      setIsConfirmDeleteOpen(false);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (
    taskId: number,
    taskData: {
      title: string;
      description?: string;
      priority: PriorityLevel;
      due_date?: string;
      column_id: number;
      assignee_id?: number;
    }
  ) => {
    await onUpdate(taskId, taskData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>

            <DialogTitle className="text-2xl font-semibold mt-2">{task.title}</DialogTitle>
            <DialogDescription className="text-slate-400 text-sm mt-1">
              {task.description}
            </DialogDescription>

          </DialogHeader>

          <div className="text-slate-400 text-xs flex justify-between items-center gap-2 mt-1">

            <span
              className={`text-xs px-2 py-0.5 rounded-full font-normal tracking-wider ${task.priority === 'urgent'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : task.priority === 'high'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : task.priority === 'medium'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
            >
              {task.priority || 'medium'} priority
            </span>
            <p> Created by {task.creator?.full_name || task.creator?.username || 'Unknown'}</p>
          </div>

          <div className="space-y-5 py-3 border-t border-b border-slate-800/80 my-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Description
              </label>
              <p className="text-sm text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 min-h-[4rem] whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400">Assigned To</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <CircleUser className="w-4 h-4 text-blue-400" />
                  <span>{task.assignee?.full_name || task.assignee?.username || 'Unassigned'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-400">Due Date</span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 bg-transparent border-0">


            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-slate-400 hover:text-blue-400 hover:bg-slate-800"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>

      </Dialog>

      <EditTaskModal
        open={isEditModalOpen}
        task={
          task
            ? {
              id: task.id,
              title: task.title,
              description: task.description,
              priority: task.priority || 'medium',
              due_date: task.due_date,
              column_id: task.column_id,
              assignee_id: task.assignee?.id,
            }
            : null
        }
        members={members}
        columns={columns}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditSubmit}
      />

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