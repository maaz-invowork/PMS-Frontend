import axios from 'axios';
import { Board, BoardColumn, Project, Task, TokenResponse, User, UserMinimal } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kinetix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kinetix_token');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authApi = {
  register: async (data: { username: string; email: string; full_name: string; password: string }) => {
    const res = await api.post<User>('/auth/register', data);
    return res.data;
  },
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.post<TokenResponse>('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get<User>('/auth/user');
    return res.data;
  },
};

// Projects Service
export const projectsApi = {
  list: async () => {
    const res = await api.get<Project[]>('/projects/');
    return res.data;
  },
  create: async (data: { title: string; description?: string }) => {
    const res = await api.post<Project>('/projects/', data);
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },
  update: async (id: number, data: { title?: string; description?: string }) => {
    const res = await api.patch<Project>(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/projects/${id}`);
  },
  addMembers: async (projectId: number, userIds: number[]) => {
    const res = await api.post(`/projects/${projectId}/members`, { user_ids: userIds });
    return res.data;
  },
  removeMembers: async (projectId: number, userIds: number[]) => {
    const res = await api.post(`/projects/${projectId}/members/remove`, { user_ids: userIds });
    return res.data;
  },
  fetchUsers: async () => {
    const res = await api.get<UserMinimal[]>('/projects/members');
    return res.data;
  }
};

// Boards Service
export const boardsApi = {
  listByProject: async (projectId: number) => {
    const res = await api.get<Board[]>(`/boards/project/${projectId}`);
    return res.data;
  },
  create: async (data: { name: string; project_id: number }) => {
    const res = await api.post<Board>('/boards/', data);
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Board>(`/boards/${id}`);
    return res.data;
  },
  update: async (id: number, data: { name: string }) => {
    const res = await api.patch<Board>(`/boards/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/boards/${id}`);
  },
};

// Columns Service
export const columnsApi = {
  listByBoard: async (boardId: number) => {
    const res = await api.get<BoardColumn[]>(`/board-columns/board/${boardId}`);
    return res.data;
  },
  create: async (data: { name: string; board_id: number; position?: number }) => {
    const res = await api.post<BoardColumn>('/board-columns/', data);
    return res.data;
  },
  update: async (id: number, data: { name?: string; position?: number }) => {
    const res = await api.patch<BoardColumn>(`/board-columns/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/board-columns/${id}`);
  },
};

// Tasks Service
export const tasksApi = {
  create: async (data: {
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    column_id: number;
    assignee_id?: number;
  }) => {
    const res = await api.post<Task>('/tasks/', data);
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get<Task>(`/tasks/${id}`);
    return res.data;
  },
  update: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      priority?: string;
      due_date?: string;
      position?: number;
      column_id?: number;
      assignee_id?: number | null;
    }
  ) => {
    const res = await api.patch<Task>(`/tasks/${id}`, data);
    return res.data;
  },
  move: async (id: number, column_id: number, position: number) => {
    const res = await api.patch<Task>(`/tasks/${id}/status`, { column_id, position });
    return res.data;
  },
  delete: async (id: number) => {
    await api.delete(`/tasks/${id}`);
  },
};
