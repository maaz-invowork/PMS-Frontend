import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PriorityLevel, UserMinimal } from '../../types';
import { CustomDatePicker } from '../../components/ui/datePicker';
import { Loader2, Pencil } from 'lucide-react';

export interface TaskToEdit {
  id: number;
  title: string;
  description?: string;
  priority: PriorityLevel;
  due_date?: string;
  column_id: number;
  assignee_id?: number;
}

interface EditTaskModalProps {
  open: boolean;
  task: TaskToEdit | null;
  columnName?: string;
  members?: UserMinimal[];
  columns?: { id: number; name: string }[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    taskId: number,
    taskData: {
      title: string;
      description?: string;
      priority: PriorityLevel;
      due_date?: string;
      column_id: number;
      assignee_id?: number;
    }
  ) => Promise<void>;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  open,
  task,
  columnName,
  members,
  columns,
  onOpenChange,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('unassigned');
  const [columnId, setColumnId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Populate state whenever task changes or modal opens
  useEffect(() => {
    if (task && open) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setAssigneeId(task.assignee_id ? task.assignee_id.toString() : 'unassigned');
      setColumnId(task.column_id);
    }
  }, [task, open]);

  const selectedMember = members?.find((m) => m.id.toString() === assigneeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !task || !columnId) return;

    setLoading(true);
    try {
      await onSubmit(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        column_id: columnId,
        assignee_id: assigneeId !== 'unassigned' ? Number(assigneeId) : undefined,
      });

      onOpenChange(false);
    } catch (err) {
      console.error('Failed to update task:', err);
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
              <Pencil className="w-4 h-4" />
            </div>
            <DialogTitle className="text-xl mt-1 font-semibold">
              Edit Task {columnName && <span className="text-slate-400 text-sm font-normal">in {columnName}</span>}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Update task details, reassign team members, or adjust priority.
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
                  <SelectItem value="low" className="text-green-400 focus:text-green-500 focus:bg-green-300/40">Low</SelectItem>
                  <SelectItem value="medium" className="text-yellow-400 focus:text-yellow-500 focus:bg-yellow-200/40">Medium</SelectItem>
                  <SelectItem value="high" className="text-orange-400 focus:text-orange-500 focus:bg-orange-300/40">High</SelectItem>
                  <SelectItem value="urgent" className="text-red-400 focus:text-red-500 focus:bg-red-300/40">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Assignee
              </label>
              <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val || 'unassigned')}>
                <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                  <SelectValue placeholder="Unassigned">
                    {selectedMember ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {(selectedMember.full_name || selectedMember.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{selectedMember.full_name || selectedMember.username}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] shrink-0">
                        ?
                      </div>
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>

                  {members && members.map((m) => {
                    const name = m.full_name || m.username;
                    const initial = name.charAt(0).toUpperCase();
                    return (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {initial}
                          </div>
                          <span>{name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {columns && columns.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status / Column
                </label>
                <Select
                  value={columnId ? columnId.toString() : ''}
                  onValueChange={(val) => setColumnId(Number(val))}
                >
                  <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                    <SelectValue placeholder="Select Column" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id.toString()}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Due Date
              </label>
              <CustomDatePicker value={dueDate} onChange={(val) => setDueDate(val)} />
            </div>
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
              className="bg-blue-500 hover:bg-blue-500/90 text-white font-semibold shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};