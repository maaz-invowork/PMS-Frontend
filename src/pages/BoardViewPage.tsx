import React, { useEffect, useState, useMemo, act } from 'react';
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
import { ManageMembersModal } from '../components/modals/ManageMembersModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { EditProjectModal } from '../components/modals/EditProjectModal';
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  Loader2,
  Trash2,
  Users,
  Columns3,
  Pencil,
} from 'lucide-react';
import { EditBoardModal } from '@/components/modals/EditBoardModal';

export const BoardViewPage: React.FC = () => {
  const { projectId, boardId } = useParams<{ projectId: string; boardId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const parsedProjectId = Number(projectId);
  const parsedBoardId = boardId ? Number(boardId) : undefined;

  // Local state for columns & tasks for drag-and-drop smooth interaction
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Modals state
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [confirmDeleteBoard, setConfirmDeleteBoard] = useState(false);
  const [confirmDeleteColumnId, setConfirmDeleteColumnId] = useState<number | null>(null);
  const [createTaskModal, setCreateTaskModal] = useState<{ open: boolean; columnId: number | null; columnName?: string }>({
    open: false,
    columnId: null,
  });
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
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
  const { data: fetchedColumns, isLoading: isColumnsLoading } = useQuery<BoardColumn[]>({
    queryKey: ['columns', activeBoard?.id],
    queryFn: () => columnsApi.listByBoard(activeBoard!.id),
    enabled: !!activeBoard?.id,
  });

  useEffect(() => {
    if (fetchedColumns) {
      setColumns(fetchedColumns);
    }
  }, [fetchedColumns]);

  // Mutations
  const createBoardMutation = useMutation({
    mutationFn: (name: string) => boardsApi.create({ name, project_id: parsedProjectId }),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards', parsedProjectId] });
      navigate(`/projects/${parsedProjectId}/boards/${newBoard.id}`);
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      boardsApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
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

  const addMembersMutation = useMutation({
    mutationFn: ({ projectId: pId, userIds }: { projectId: number; userIds: number[] }) =>
      projectsApi.addMembers(pId, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', parsedProjectId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ projectId: pId, userId }: { projectId: number; userId: number }) =>
      projectsApi.removeMembers(pId, [userId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', parsedProjectId] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, title, description }: { id: number; title: string; description?: string }) =>
      projectsApi.update(id, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setConfirmDeleteProject(false);
      navigate('/projects');
    },
  });

  const isOwner = !!(currentUser && project && currentUser.id === project.owner?.id);

  // Column IDs for SortableContext
  const columnIds = useMemo(() => columns.map((c) => `column-${c.id}`), [columns]);

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

const parseId = (id: string | number | undefined): number | null => {
  if (id === undefined || id === null) return null;
  if (typeof id === 'number') return id;
  const parts = id.toString().split('-');
  return Number(parts[parts.length - 1]);
};

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = parseId(active.id);
    const overId = parseId(over.id);

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

    const activeId = parseId(active.id);
    const overId = parseId(over.id);

    if (activeId === null || overId === null) return;    

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

  if (isProjectLoading || isBoardsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-3 text-slate-300">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden">
      <Navbar />

      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

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

            {activeBoard && isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteProject(true)}
                className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10  border-2 border-rose-500/30 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Project
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditProjectOpen(true)}
              className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 border-2 border-blue-500/30 text-xs"
            >
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Project
            </Button>


            {activeBoard && isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteBoard(true)}
                className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10  border-2 border-rose-500/30 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Board
              </Button>
            )}

            {activeBoard && isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditBoardOpen(true)}
                className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10  border-2 border-blue-500/30 text-xs"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Board
              </Button>
            )}


            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsManageMembersOpen(true)}
                className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 border-2 border-blue-500/30 text-xs"
              >
                <Users className="w-3.5 h-3.5 mr-1" /> Manage Members
              </Button>
            )}

            <Button
              onClick={() => setIsCreateColumnOpen(true)}
              disabled={!activeBoard}
              size="sm"
              className="bg-blue-500 hover:bg-blue-500/90 text-white font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Column</span>
            </Button>
          </div>
        </div>

        {/* Board Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-slate-800/50">

          {boards.map((b) => (
            <Link
              key={b.id}
              to={`/projects/${parsedProjectId}/boards/${b.id}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeBoard?.id === b.id
                ? 'bg-blue-500 text-black shadow-md shadow-blue-600/20'
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
      <main className="flex-1 p-0 overflow-x-auto mx-4">
        {!activeBoard ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 border border-slate-800/80 rounded-2xl max-w-lg mx-auto text-center space-y-4 mt-10">
            <FolderKanban className="w-12 h-12 text-slate-600" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">No Board Created Yet</h3>
              <p className="text-xs text-slate-400">
                Create a board for this project to start organizing tasks with kanban columns.
              </p>
            </div>
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
            <div className="flex items-start gap-4 pt-4 pb-6">
              <SortableContext items={columnIds} >
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
                    onDeleteColumn={(cId) => setConfirmDeleteColumnId(cId)}
                    onClickTask={(task) => setSelectedTask(task)}
                  />
                ))}
              </SortableContext>

              {columns.length === 0 && (
                <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-18rem)]">
                  <div className="flex flex-col items-center gap-4 text-center px-6 py-10 rounded-2xl bg-slate-900/50 border border-slate-800/80 border-dashed max-w-sm w-full">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Columns3 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-200">No Columns Yet</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Create a Column inside this board to start organizing tasks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drag Overlay Preview */}
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  tasks={activeColumn.tasks}
                  onAddTask={() => { }}
                  onUpdateColumn={() => { }}
                  onDeleteColumn={() => { }}
                  onClickTask={() => { }}
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
        members={project?.members}
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
        members={project?.members}
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

      <EditProjectModal
        project={project ?? null}
        open={isEditProjectOpen}
        onOpenChange={setIsEditProjectOpen}
        onSubmit={async (title, description) => {
          if (project) {
            await updateProjectMutation.mutateAsync({
              id: project.id,
              title,
              description,
            });
          }
        }}
      />

      <EditBoardModal
        board={activeBoard ?? null}
        open={isEditBoardOpen}
        onOpenChange={setIsEditBoardOpen}
        onUpdateBoard={async (name) => {
          if (activeBoard) {
            await updateBoardMutation.mutateAsync({
              id: activeBoard.id,
              name
            });
          }
        }}
      />

      <ManageMembersModal
        project={project ?? null}
        open={isManageMembersOpen}
        onOpenChange={setIsManageMembersOpen}
        onAddMembers={async (projId, userIds) => {
          await addMembersMutation.mutateAsync({ projectId: projId, userIds });
        }}
        onRemoveMember={async (projId, userId) => {
          await removeMemberMutation.mutateAsync({ projectId: projId, userId });
        }}
      />

      <ConfirmModal
        open={confirmDeleteBoard}
        onOpenChange={setConfirmDeleteBoard}
        title="Delete Board"
        message={`Are you sure you want to delete the board "${activeBoard?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Board"
        onConfirm={() => activeBoard && deleteBoardMutation.mutate(activeBoard.id)}
      />

      <ConfirmModal
        open={confirmDeleteColumnId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteColumnId(null)}
        title="Delete Column"
        message="Are you sure you want to delete this column and all its tasks? This action cannot be undone."
        confirmLabel="Delete Column"
        onConfirm={() => confirmDeleteColumnId !== null && deleteColumnMutation.mutate(confirmDeleteColumnId)}
      />
      <ConfirmModal
        open={confirmDeleteProject}
        onOpenChange={setConfirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project?.title}"? All associated boards will be removed. This action cannot be undone.`}
        confirmLabel="Delete Project"
        onConfirm={() => deleteProjectMutation.mutate(parsedProjectId)}
      />
    </div>
  );
};
