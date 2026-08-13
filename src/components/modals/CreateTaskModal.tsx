import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PriorityLevel, UserMinimal } from '../../types';
import { Loader2, CheckSquare } from 'lucide-react';

interface CreateTaskModalProps {
  open: boolean;
  columnId: number | null;
  columnName?: string;
  members: UserMinimal[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskData: {
    title: string;
    description?: string;
    priority: PriorityLevel;
    due_date?: string;
    column_id: number;
    assignee_id?: number;
  }) => Promise<void>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  columnId,
  columnName,
  members,
  onOpenChange,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('unassigned');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        column_id: columnId,
        assignee_id: assigneeId !== 'unassigned' ? Number(assigneeId) : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssigneeId('unassigned');
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl mt-1 font-semibold">
              Add Task
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Define task details, assign team members, and set priority.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Task Title *
            </label>
            <Input
              required
              placeholder="e.g. Implement JWT Auth endpoint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-950/60 border-slate-800 focus:border-blue-500 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Task instructions or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Priority
              </label>
              <Select value={priority} onValueChange={(val) => setPriority(val as PriorityLevel)}>
                <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="low" className="text-green-400 hover:bg-green-500/20  focus:bg-green-500/20 focus:text-green-300">Low</SelectItem>
                  <SelectItem value="medium" className="text-yellow-400 focus:bg-yellow-500/20 focus:text-yellow-300">Medium</SelectItem>
                  <SelectItem value="high" className="text-orange-400 focus:bg-orange-500/20 focus:text-orange-300">High</SelectItem>
                  <SelectItem value="urgent" className="text-red-400 focus:bg-red-500/20 focus:text-red-300">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Assignee
              </label>
              <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val || 'unassigned')}>
                <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                  <SelectValue placeholder="Unassigned" />
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
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-950/60 border-slate-800 focus:border-blue-500 text-slate-100"
            />
          </div>

          <DialogFooter className="pt-2 bg-transparent border-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                </span>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
