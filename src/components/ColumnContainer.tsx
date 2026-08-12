import React, { useMemo, useState } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BoardColumn, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Plus, GripHorizontal, Trash2, Edit2, Check, X } from 'lucide-react';
import { Input } from './ui/input';

interface ColumnContainerProps {
  column: BoardColumn;
  tasks: Task[];
  onAddTask: (columnId: number, columnName: string) => void;
  onUpdateColumn: (columnId: number, name: string) => void;
  onDeleteColumn: (columnId: number) => void;
  onClickTask: (task: Task) => void;
}

export const ColumnContainer: React.FC<ColumnContainerProps> = ({
  column,
  tasks,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onClickTask,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.name);

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleSaveTitle = () => {
    if (title.trim() && title.trim() !== column.name) {
      onUpdateColumn(column.id, title.trim());
    }
    setIsEditingTitle(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-80 min-w-[20rem] max-w-[20rem] h-[650px] rounded-2xl bg-slate-900/30 border-2 border-dashed border-indigo-500/50 opacity-40"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 min-w-[20rem] max-w-[20rem] max-h-[calc(100vh-12rem)] flex flex-col bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-md"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-900 transition-colors shrink-0"
            title="Drag column"
          >
            <GripHorizontal className="w-4 h-4" />
          </button>

          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="h-7 text-xs bg-slate-900 border-slate-700 text-slate-100 px-2"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="text-emerald-400 hover:text-emerald-300 p-1"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="text-slate-400 hover:text-slate-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-sm text-slate-200 truncate">{column.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                {tasks.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isEditingTitle && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-900 transition-colors"
              title="Edit column title"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDeleteColumn(column.id)}
            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
            title="Delete column"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task List (Sortable Area) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[100px]">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClickTask={onClickTask} />
          ))}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <div className="pt-3 mt-2 border-t border-slate-800/80">
        <Button
          onClick={() => onAddTask(column.id, column.name)}
          variant="outline"
          className="w-full bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-blue-400 border-slate-800 hover:border-slate-700 font-medium text-xs justify-center gap-2 h-9"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </Button>
      </div>
    </div>
  );
};
