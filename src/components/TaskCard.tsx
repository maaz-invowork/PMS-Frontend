import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, GripVertical, User as UserIcon, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClickTask?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClickTask }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full h-24 rounded-xl bg-slate-900/40 border-2 border-dashed border-blue-500/50 opacity-40"
      />
    );
  }

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'low':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
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
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onClickTask && onClickTask(task)}
      className="group relative w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer space-y-2.5"
    >
      {/* Header: Grip + Title + Priority */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-800 transition-colors shrink-0"
            title="Drag task"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <h4 className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-2">
            {task.title}
          </h4>
        </div>

        {task.priority && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border shrink-0 ${getPriorityStyle(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        )}
      </div>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 pl-6">
          {task.description}
        </p>
      )}

      {/* Footer Info: Due Date + Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 pl-6">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>
            {task.due_date
              ? new Date(task.due_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              : 'No deadline'}
          </span>
        </div>

        {task.assignee ? (
          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.full_name}`}>
            <Avatar className="w-5 h-5 bg-blue-600 text-white font-bold text-[9px]">
              <AvatarFallback>{getInitials(task.assignee.full_name)}</AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-medium text-slate-300 max-w-[80px] truncate">
              {task.assignee.full_name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-600 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
};
