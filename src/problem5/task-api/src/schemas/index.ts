export interface User {
  id: string;
  email: string;
  password: string;
  refreshToken?: string | null;
  createdAt: Date;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  userId: string;
  user?: User;
}
