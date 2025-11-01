import axios from 'utils/axios';

// Types
export interface User {
  id: string; // UUID
  name: string;
  email: string;
  avatar?: string;
}

export interface UserResponse {
  status: string;
  content: User[];
}

// API Functions
export const getUsers = async (): Promise<UserResponse> => {
  const response = await axios.get('/api/users/');
  return response.data;
};
