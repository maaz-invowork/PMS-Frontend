import React, { useMemo, useState } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BoardColumn, Task } from '../types';
import { TaskCard } from './TaskCard';
import { Button } from './ui/button';
import { Plus, GripHorizontal, Trash2, Edit2, Check, X, MoreVertical } from 'lucide-react';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { EditColumnModal } from './modals/EditColumnModal';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [columnName, setColumnName] = useState(column.name);

  const taskIds = useMemo(() => tasks.map((t) => `task-${t.id}`), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const handleOpenEditModal = () => {
    setColumnName(column.name);
    setIsEditModalOpen(true);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-60 min-w-[20rem] max-w-[20rem] h-auto min-h-[350px] rounded-2xl bg-slate-900/30 border-2 border-dashed border-blue-500/50 opacity-40 mt-4"
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="w-60 min-w-[20rem] max-w-[20rem] h-auto min-h-[350px] flex flex-col bg-slate-500/10 border border-slate-800/80 rounded-2xl p-3 shadow-xl backdrop-blur-md mt-4"
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

            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-sm text-slate-200 truncate">{column.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                {tasks.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onAddTask(column.id, column.name)}
              className="mt-0 text-slate-500 hover:text-blue-400 p-1 rounded hover:bg-blue-500/10 transition-colors"
              title="Add Task"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="mt-[0.5px] text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800/80 transition-colors"
                    title="Column options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <DropdownMenuContent align="start" className="w-40 bg-slate-900 text-slate-200 border border-slate-800/80">
                <DropdownMenuItem
                  onClick={handleOpenEditModal}
                  className="cursor-pointer gap-2 hover:bg-slate-800 text-xs focus:bg-slate-800 focus:text-slate-100 pt-2 pb-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Column</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteColumn(column.id)}
                  className="cursor-pointer gap-2 text-rose-400 focus:text-rose-300 hover:bg-rose-500/10 focus:bg-rose-500/10 text-xs pt-2 pb-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Column</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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

        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <Button
            onClick={() => onAddTask(column.id, column.name)}
            variant="outline"
            className="w-full bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-blue-400 border-slate-800 hover:border-slate-700 font-medium text-xs justify-center gap-2 h-10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[10px]">Add Task</span>
          </Button>
        </div>
      </div>

      <EditColumnModal
        column={column ?? null}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdateColumn={onUpdateColumn}
      />

    </>
  );
};
