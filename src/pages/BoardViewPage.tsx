import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { projectsApi, boardsApi, columnsApi, tasksApi } from '../lib/api';
import { Board, BoardColumn, Project, Task } from '../types';
import { Navbar } from '../components/Navbar';
import { ColumnContainer } from '../components/ColumnContainer';
import { TaskCard } from '../components/TaskCard';
import { CreateBoardModal } from '../components/modals/CreateBoardModal';
import { CreateColumnModal } from '../components/modals/CreateColumnModal';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { TaskDetailModal } from '../components/modals/TaskDetailModal';
import { Button } from '../components/ui/button';
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  Users,
  LayoutGrid,
} from 'lucide-react';

export const BoardViewPage: React.FC = () => {
  const { projectId, boardId } = useParams<{ projectId: string; boardId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const parsedProjectId = Number(projectId);
  const parsedBoardId = boardId ? Number(boardId) : undefined;

  // Local state for columns & tasks for drag-and-drop smooth interaction
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Modals state
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [createTaskModal, setCreateTaskModal] = useState<{ open: boolean; columnId: number | null; columnName?: string }>({
    open: false,
    columnId: null,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  // Fetch Project Detail
  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ['project', parsedProjectId],
    queryFn: () => projectsApi.getById(parsedProjectId),
    enabled: !isNaN(parsedProjectId),
  });

  // Fetch Boards for Project
  const { data: boards = [], isLoading: isBoardsLoading } = useQuery<Board[]>({
    queryKey: ['boards', parsedProjectId],
    queryFn: () => boardsApi.listByProject(parsedProjectId),
    enabled: !isNaN(parsedProjectId),
  });

  // Determine current active board
  const activeBoard = useMemo(() => {
    if (parsedBoardId) {
      return boards.find((b) => b.id === parsedBoardId) || null;
    }
    return boards.length > 0 ? boards[0] : null;
  }, [boards, parsedBoardId]);

  // Fetch Columns for active board
  const { data: fetchedColumns = [], isLoading: isColumnsLoading } = useQuery<BoardColumn[]>({
    queryKey: ['columns', activeBoard?.id],
    queryFn: () => columnsApi.listByBoard(activeBoard!.id),
    enabled: !!activeBoard?.id,
  });

  // Sync fetched columns into local state
  useEffect(() => {
    if (fetchedColumns) {
      setColumns(fetchedColumns);
    }
  }, [fetchedColumns]);

  // If no boardId in URL but boards exist, navigate to first board
  useEffect(() => {
    if (!boardId && boards.length > 0) {
      navigate(`/projects/${projectId}/boards/${boards[0].id}`, { replace: true });
    }
  }, [boardId, boards, projectId, navigate]);

  // Column / Board / Task Mutations
  const createBoardMutation = useMutation({
    mutationFn: (name: string) => boardsApi.create({ name, project_id: parsedProjectId }),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', parsedProjectId] });
      navigate(`/projects/${parsedProjectId}/boards/${newBoard.id}`);
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (id: number) => boardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', parsedProjectId] });
      navigate(`/projects/${parsedProjectId}`);
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => columnsApi.create({ name, board_id: activeBoard!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', activeBoard?.id] });
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => columnsApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', activeBoard?.id] });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: (id: number) => columnsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', activeBoard?.id] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', activeBoard?.id] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', activeBoard?.id] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', activeBoard?.id] });
    },
  });

  // Column IDs for SortableContext
  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === 'Column') {
      setActiveColumn(active.data.current?.column);
      return;
    }

    if (type === 'Task') {
      setActiveTask(active.data.current?.task);
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';

    if (!isActiveTask) return;

    // Task over Task
    if (isActiveTask && isOverTask) {
      setColumns((prevCols) => {
        const activeColumnIndex = prevCols.findIndex((col) =>
          col.tasks.some((t) => t.id === activeId)
        );
        const overColumnIndex = prevCols.findIndex((col) =>
          col.tasks.some((t) => t.id === overId)
        );

        if (activeColumnIndex === -1 || overColumnIndex === -1) return prevCols;

        const activeTaskIndex = prevCols[activeColumnIndex].tasks.findIndex(
          (t) => t.id === activeId
        );
        const overTaskIndex = prevCols[overColumnIndex].tasks.findIndex(
          (t) => t.id === overId
        );

        const newCols = [...prevCols];

        if (activeColumnIndex !== overColumnIndex) {
          const [movedTask] = newCols[activeColumnIndex].tasks.splice(activeTaskIndex, 1);
          movedTask.column_id = newCols[overColumnIndex].id;
          newCols[overColumnIndex].tasks.splice(overTaskIndex, 0, movedTask);
        } else {
          newCols[activeColumnIndex].tasks = arrayMove(
            newCols[activeColumnIndex].tasks,
            activeTaskIndex,
            overTaskIndex
          );
        }

        return newCols;
      });
    }

    // Task over Column
    const isOverColumn = over.data.current?.type === 'Column';
    if (isActiveTask && isOverColumn) {
      setColumns((prevCols) => {
        const activeColumnIndex = prevCols.findIndex((col) =>
          col.tasks.some((t) => t.id === activeId)
        );
        const overColumnIndex = prevCols.findIndex((col) => col.id === overId);

        if (activeColumnIndex === -1 || overColumnIndex === -1) return prevCols;
        if (activeColumnIndex === overColumnIndex) return prevCols;

        const activeTaskIndex = prevCols[activeColumnIndex].tasks.findIndex(
          (t) => t.id === activeId
        );

        const newCols = [...prevCols];
        const [movedTask] = newCols[activeColumnIndex].tasks.splice(activeTaskIndex, 1);
        movedTask.column_id = newCols[overColumnIndex].id;
        newCols[overColumnIndex].tasks.push(movedTask);

        return newCols;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Handle Column Drag Reorder
    if (active.data.current?.type === 'Column' && activeId !== overId) {
      const oldIndex = columns.findIndex((c) => c.id === activeId);
      const newIndex = columns.findIndex((c) => c.id === overId);

      const newCols = arrayMove(columns, oldIndex, newIndex);
      setColumns(newCols);

      // Persist column order
      newCols.forEach((col, idx) => {
        columnsApi.update(col.id, { position: idx + 1 });
      });
      return;
    }

    // Handle Task Drag
    if (active.data.current?.type === 'Task') {
      const activeTaskItem = active.data.current.task as Task;
      // Find current column and position of task in updated columns state
      let targetColumnId: number | null = null;
      let targetPosition = 0;

      columns.forEach((col) => {
        const index = col.tasks.findIndex((t) => t.id === activeId);
        if (index !== -1) {
          targetColumnId = col.id;
          targetPosition = index + 1;
        }
      });

      if (targetColumnId !== null) {
        try {
          await tasksApi.move(activeTaskItem.id, targetColumnId, targetPosition);
        } catch (err) {
          console.error('Failed to move task:', err);
          queryClient.invalidateQueries({ queryKey: ['columns', activeBoard?.id] });
        }
      }
    }
  };

  const allMembers = useMemo(() => {
    if (!project) return [];
    return [project.owner, ...project.members];
  }, [project]);

  if (isProjectLoading || isBoardsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-3 text-slate-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading board workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Workspace Sub-Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/projects"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Back to projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{project?.title}</h1>
              </div>
              <p className="text-xs text-slate-400">
                {project?.description || 'Project Workspace Board View'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeBoard && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm(`Delete board "${activeBoard.name}"?`)) {
                    deleteBoardMutation.mutate(activeBoard.id);
                  }
                }}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Board
              </Button>
            )}

            <Button
              onClick={() => setIsCreateColumnOpen(true)}
              disabled={!activeBoard}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Column</span>
            </Button>
          </div>
        </div>

        {/* Board Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-slate-800/50">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" /> Boards:
          </span>

          {boards.map((b) => (
            <Link
              key={b.id}
              to={`/projects/${parsedProjectId}/boards/${b.id}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeBoard?.id === b.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {b.name}
            </Link>
          ))}

          <Button
            onClick={() => setIsCreateBoardOpen(true)}
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> New Board
          </Button>
        </div>
      </div>

      {/* Main Kanban Board Canvas */}
      <main className="flex-1 p-6 overflow-x-auto">
        {!activeBoard ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800/80 rounded-2xl max-w-lg mx-auto text-center space-y-4">
            <FolderKanban className="w-12 h-12 text-slate-600" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">No Board Created Yet</h3>
              <p className="text-xs text-slate-400">
                Create a board for this project to start organizing tasks with kanban columns.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateBoardOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create First Board
            </Button>
          </div>
        ) : isColumnsLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm text-slate-400">Loading columns...</span>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start gap-5 min-h-[calc(100vh-16rem)] pb-8">
              <SortableContext items={columnIds}>
                {columns.map((col) => (
                  <ColumnContainer
                    key={col.id}
                    column={col}
                    tasks={col.tasks}
                    onAddTask={(cId, cName) =>
                      setCreateTaskModal({ open: true, columnId: cId, columnName: cName })
                    }
                    onUpdateColumn={(cId, name) =>
                      updateColumnMutation.mutate({ id: cId, name })
                    }
                    onDeleteColumn={(cId) => {
                      if (confirm('Delete this column and all its tasks?')) {
                        deleteColumnMutation.mutate(cId);
                      }
                    }}
                    onClickTask={(task) => setSelectedTask(task)}
                  />
                ))}
              </SortableContext>

              {/* Quick Add Column Card */}
              <button
                onClick={() => setIsCreateColumnOpen(true)}
                className="w-80 min-w-[20rem] max-w-[20rem] h-32 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-400 transition-all font-semibold text-sm group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-blue-500/10 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add Another Column</span>
              </button>
            </div>

            {/* Drag Overlay Preview */}
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  tasks={activeColumn.tasks}
                  onAddTask={() => {}}
                  onUpdateColumn={() => {}}
                  onDeleteColumn={() => {}}
                  onClickTask={() => {}}
                />
              )}
              {activeTask && <TaskCard task={activeTask} />}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Modals */}
      <CreateBoardModal
        open={isCreateBoardOpen}
        onOpenChange={setIsCreateBoardOpen}
        onSubmit={async (name) => {
          await createBoardMutation.mutateAsync(name);
        }}
      />

      <CreateColumnModal
        open={isCreateColumnOpen}
        onOpenChange={setIsCreateColumnOpen}
        onSubmit={async (name) => {
          await createColumnMutation.mutateAsync(name);
        }}
      />

      <CreateTaskModal
        open={createTaskModal.open}
        columnId={createTaskModal.columnId}
        columnName={createTaskModal.columnName}
        members={allMembers}
        onOpenChange={(open) =>
          setCreateTaskModal((prev) => ({ ...prev, open }))
        }
        onSubmit={async (taskData) => {
          await createTaskMutation.mutateAsync(taskData);
        }}
      />

      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        members={allMembers}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onUpdate={async (taskId, data) => {
          await updateTaskMutation.mutateAsync({ id: taskId, data });
          setSelectedTask(null);
        }}
        onDelete={async (taskId) => {
          await deleteTaskMutation.mutateAsync(taskId);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};
