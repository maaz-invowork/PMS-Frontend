export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface UserMinimal {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export interface User extends UserMinimal {
  role?: Role;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority?: PriorityLevel;
  due_date?: string;
  position: number;
  column_id: number;
  assignee?: UserMinimal;
  creator?: UserMinimal;
}

export interface BoardColumn {
  id: number;
  name: string;
  position: number;
  board_id: number;
  tasks: Task[];
}

export interface Board {
  id: number;
  name: string;
  project_id: number;
  columns: BoardColumn[];
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  owner: UserMinimal;
  members: UserMinimal[];
  boards: Board[];
}
